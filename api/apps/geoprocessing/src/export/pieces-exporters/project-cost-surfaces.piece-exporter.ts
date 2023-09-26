import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ClonePiece, ExportJobInput, ExportJobOutput } from '@marxan/cloning';
import { ComponentLocation, ResourceKind } from '@marxan/cloning/domain';
import { ClonePieceRelativePathResolver } from '@marxan/cloning/infrastructure/clone-piece-data';
import {
  ProjectCustomFeature,
  ProjectCustomFeaturesContent,
} from '@marxan/cloning/infrastructure/clone-piece-data/project-custom-features';
import { CloningFilesRepository } from '@marxan/cloning-files-repository';
import { GeometrySource } from '@marxan/geofeatures';
import { Injectable, Logger } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { isLeft } from 'fp-ts/lib/Either';
import { Readable } from 'stream';
import { EntityManager } from 'typeorm';
import {
  ExportPieceProcessor,
  PieceExportProvider,
} from '../pieces/export-piece-processor';
import { ProjectsPuEntity } from '@marxan-jobs/planning-unit-geometry';
import { ProjectCostSurfacesContent } from '@marxan/cloning/infrastructure/clone-piece-data/project-cost-surfaces';

type CreationStatus = ProjectCustomFeature['creation_status'];

type ProjectCostSurfacesSelectResult = {
  id: string;
  name: string;
  min: number;
  max: number;
  is_default: boolean;
};

type CostSurfaceDataSelectResult = {
  cost_surface_id: string;
  cost: number;
  projects_pu_id: number;
};

@Injectable()
@PieceExportProvider()
export class ProjectCostSurfacesPieceExporter implements ExportPieceProcessor {
  private readonly logger: Logger = new Logger(
    ProjectCostSurfacesPieceExporter.name,
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
      piece === ClonePiece.ProjectCostSurfaces && kind === ResourceKind.Project
    );
  }

  async run(input: ExportJobInput): Promise<ExportJobOutput> {
    const costSurfaces: ProjectCostSurfacesSelectResult[] = await this.apiEntityManager
      .createQueryBuilder()
      .select(['cs.id', 'cs.name', 'cs.min', 'cs.max', 'cs.is_default'])
      .from('cost_surfaces', 'cs')
      .where('cs.project_id = :projectId', { projectId: input.resourceId })
      .execute();

    const costSurfacesIds = costSurfaces.map((costSurface) => costSurface.id);
    let costSurfaceData: CostSurfaceDataSelectResult[] = [];
    let projectPusMap: Record<string, number> = {};
    if (costSurfacesIds.length > 0) {
      costSurfaceData = await this.geoprocessingEntityManager
        .createQueryBuilder()
        .select(['cost_surface_id', 'cost', 'projects_pu_id'])
        .from('cost_surface_pu_data', 'scpd')
        .where('cost_surface_id IN (:...costSurfacesIds)', {
          costSurfacesIds,
        })
        .execute();

      projectPusMap = await this.getProjectPusMap(input.resourceId);
    }

    const fileContent: ProjectCostSurfacesContent = {
      costSurfaces: costSurfaces.map(({ id, ...costSurface }) => ({
        ...costSurface,
        data: costSurfaceData.filter((data : CostSurfaceDataSelectResult) => data.cost_surface_id === id)
          .map(({ cost_surface_id, projects_pu_id, ...data }) => {
            const puid = projectPusMap[projects_pu_id];
            return { puid, ...data };
          }),
      })),
    };

    const relativePath = ClonePieceRelativePathResolver.resolveFor(
      ClonePiece.ProjectCostSurfaces,
    );

    const outputFile = await this.fileRepository.saveCloningFile(
      input.exportId,
      Readable.from(JSON.stringify(fileContent)),
      relativePath,
    );

    if (isLeft(outputFile)) {
      const errorMessage = `${ProjectCostSurfacesPieceExporter.name} - Project Cost Surfaces - couldn't save file - ${outputFile.left.description}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    return {
      ...input,
      uris: [new ComponentLocation(outputFile.right, relativePath)],
    };
  }

  private async getProjectPusMap(
    projectId: string,
  ): Promise<Record<string, number>> {
    const projectPus: {
      id: string;
      puid: number;
    }[] = await this.geoprocessingEntityManager
      .createQueryBuilder()
      .select(['id', 'puid'])
      .from(ProjectsPuEntity, 'ppus')
      .where('ppus.project_id = :projectId', { projectId })
      .execute();

    const projectPuIdByPuid: Record<string, number> = {};
    projectPus.forEach(({ puid, id }) => {
      projectPuIdByPuid[id] = puid;
    });

    return projectPuIdByPuid;
  }
}
