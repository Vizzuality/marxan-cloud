import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ClonePiece, ImportJobInput, ImportJobOutput } from '@marxan/cloning';
import { ResourceKind } from '@marxan/cloning/domain';
import { ProjectCustomFeaturesContent } from '@marxan/cloning/infrastructure/clone-piece-data/project-custom-features';
import { CloningFilesRepository } from '@marxan/cloning-files-repository';
import { GeoFeatureGeometry } from '@marxan/geofeatures';
import { readableToBuffer } from '@marxan/utils';
import { Injectable, Logger } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { isLeft } from 'fp-ts/lib/Either';
import { EntityManager } from 'typeorm';
import { v4 } from 'uuid';
import {
  ImportPieceProcessor,
  PieceImportProvider,
} from '../pieces/import-piece-processor';
import { chunk } from 'lodash';
import { ProjectsPuEntity } from '@marxan-jobs/planning-unit-geometry';
import { CHUNK_SIZE_FOR_BATCH_GEODB_OPERATIONS } from '@marxan-geoprocessing/utils/chunk-size-for-batch-geodb-operations';
import {
  CostSurfaceData,
  ProjectCostSurfacesContent
} from "@marxan/cloning/infrastructure/clone-piece-data/project-cost-surfaces";
import { CostSurfacePuDataEntity } from "@marxan/cost-surfaces";

@Injectable()
@PieceImportProvider()
export class ProjectCostSurfacesPieceImporter
  implements ImportPieceProcessor {
  private readonly logger: Logger = new Logger(
    ProjectCostSurfacesPieceImporter.name,
  );

  constructor(
    private readonly fileRepository: CloningFilesRepository,
    @InjectEntityManager(geoprocessingConnections.apiDB)
    private readonly apiEntityManager: EntityManager,
    @InjectEntityManager(geoprocessingConnections.default)
    private readonly geoprocessingEntityManager: EntityManager,
  ) {}

  isSupported(piece: ClonePiece, kind: ResourceKind): boolean {
    return (
      piece === ClonePiece.ProjectCostSurfaces &&
      kind === ResourceKind.Project
    );
  }

  async run(input: ImportJobInput): Promise<ImportJobOutput> {
    const { uris, pieceResourceId, projectId, piece } = input;
    let returnValue: ImportJobOutput = {} as ImportJobOutput;

    try {
      if (uris.length !== 1) {
        const errorMessage = `uris array has an unexpected amount of elements: ${uris.length}`;
        this.logger.error(errorMessage);
        throw new Error(errorMessage);
      }
      const [projectCostSurfacesLocation] = uris;

      const readableOrError = await this.fileRepository.get(
        projectCostSurfacesLocation.uri,
      );
      if (isLeft(readableOrError)) {
        const errorMessage = `File with piece data for ${piece}/${pieceResourceId} is not available at ${projectCostSurfacesLocation.uri}`;
        this.logger.error(errorMessage);
        throw new Error(errorMessage);
      }

      const buffer = await readableToBuffer(readableOrError.right);
      const projectCostSurfacesOrError = buffer.toString();

      const { costSurfaces }: ProjectCostSurfacesContent = JSON.parse(
        projectCostSurfacesOrError,
      );

      returnValue = {
        importId: input.importId,
        componentId: input.componentId,
        pieceResourceId,
        projectId,
        piece: input.piece,
      };

      if (!costSurfaces.length) return returnValue;

      const projectPusMap = await this.getProjectPusMap(projectId);

      await this.apiEntityManager.transaction(async (apiEm) => {
        const costSurfacesInsertValues: any[] = [];
        let costSurfacesDataInsertValues: any[] = [];
        costSurfaces.forEach(({ data, ...costSurface }) => {
          const costSurfaceId = v4();

          costSurfacesInsertValues.push({
            ...costSurface,
            project_id: projectId,
            id: costSurfaceId,
          });

          const costSurfaceData = data.map((data: CostSurfaceData) => ({
              ...data,
              cost_surface_id: costSurfaceId,
            }))


          const costSurfaceInsertData = costSurfaceData.map(
            (data: CostSurfaceData) => ({
              costSurfaceId: costSurfaceId,
              cost: data.cost,
              projectsPuId: projectPusMap[data.puid],

            }),
          );

          costSurfacesDataInsertValues = costSurfacesDataInsertValues.concat(costSurfaceInsertData);

        });

        await Promise.all(
          costSurfacesInsertValues.map((values) =>
            apiEm
              .createQueryBuilder()
              .insert()
              .into('cost_surfaces')
              .values(values)
              .execute(),
          ),
        );

        await Promise.all(
          chunk(
            costSurfacesDataInsertValues,
            CHUNK_SIZE_FOR_BATCH_GEODB_OPERATIONS,
          ).map((values) =>
            this.geoprocessingEntityManager
              .createQueryBuilder()
              .insert()
              .into(CostSurfacePuDataEntity)
              .values(values)
              .execute(),
          ),
        );
      });
    } catch (e) {
      this.logger.error(e);
      throw e;
    }

    return returnValue;
  }

  private async getProjectPusMap(
    projectId: string,
  ): Promise<Record<number, string>> {
    const projectPus: {
      id: string;
      puid: number;
    }[] = await this.geoprocessingEntityManager
      .createQueryBuilder()
      .select(['id', 'puid'])
      .from(ProjectsPuEntity, 'ppus')
      .where('ppus.project_id = :projectId', { projectId })
      .execute();

    const projectPuIdByPuid: Record<number, string> = {};
    projectPus.forEach(({ puid, id }) => {
      projectPuIdByPuid[puid] = id;
    });

    return projectPuIdByPuid;
  }
}
