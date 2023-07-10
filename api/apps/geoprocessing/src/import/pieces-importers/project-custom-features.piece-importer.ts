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

@Injectable()
@PieceImportProvider()
export class ProjectCustomFeaturesPieceImporter
  implements ImportPieceProcessor {
  private readonly logger: Logger = new Logger(
    ProjectCustomFeaturesPieceImporter.name,
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
      piece === ClonePiece.ProjectCustomFeatures &&
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
      const [customProjectFeaturesLocation] = uris;

      const readableOrError = await this.fileRepository.get(
        customProjectFeaturesLocation.uri,
      );
      if (isLeft(readableOrError)) {
        const errorMessage = `File with piece data for ${piece}/${pieceResourceId} is not available at ${customProjectFeaturesLocation.uri}`;
        this.logger.error(errorMessage);
        throw new Error(errorMessage);
      }

      const buffer = await readableToBuffer(readableOrError.right);
      const customProjectFeaturesOrError = buffer.toString();

      const { features }: ProjectCustomFeaturesContent = JSON.parse(
        customProjectFeaturesOrError,
      );

      returnValue = {
        importId: input.importId,
        componentId: input.componentId,
        pieceResourceId,
        projectId,
        piece: input.piece,
      };

      if (!features.length) return returnValue;

      const projectPusMap = await this.getProjectPusMap(projectId);

      await this.apiEntityManager.transaction(async (apiEm) => {
        const featureIdByClassName: Record<string, string> = {};
        const featureInsertValues: any[] = [];
        const featureTagInsertValues: any[] = [];
        features.forEach(({ data, tag, ...feature }) => {
          const featureId = v4();
          featureIdByClassName[feature.feature_class_name] = featureId;

          featureInsertValues.push({
            ...feature,
            project_id: projectId,
            id: featureId,
          });

          if (tag) {
            featureTagInsertValues.push({
              project_id: projectId,
              feature_id: featureId,
              tag,
            });
          }
        });

        await Promise.all(
          featureInsertValues.map((values) =>
            apiEm
              .createQueryBuilder()
              .insert()
              .into('features')
              .values(values)
              .execute(),
          ),
        );

        await Promise.all(
          featureTagInsertValues.map((values) =>
            apiEm
              .createQueryBuilder()
              .insert()
              .into('project_feature_tags')
              .values(values)
              .execute(),
          ),
        );

        const featuresData = features.flatMap((feature) =>
          feature.data.map((data) => ({
            ...data,
            feature_class_name: feature.feature_class_name,
          })),
        );

        const featuresDataInsertValues = featuresData.map(
          ({ feature_class_name, projectPuPuid, ...data }) => ({
            theGeom: () => `'${data.the_geom}'`,
            properties: data.properties,
            source: data.source,
            featureId: featureIdByClassName[feature_class_name],
            amount: data.amount,
            projectPuId: projectPuPuid
              ? projectPusMap[projectPuPuid]
              : undefined,
          }),
        );

        await Promise.all(
          chunk(
            featuresDataInsertValues,
            CHUNK_SIZE_FOR_BATCH_GEODB_OPERATIONS,
          ).map((values) =>
            this.geoprocessingEntityManager
              .createQueryBuilder()
              .insert()
              .into(GeoFeatureGeometry)
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
