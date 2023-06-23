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

type CreationStatus = ProjectCustomFeature['creation_status'];

type ProjectCustomFeaturesSelectResult = {
  id: string;
  feature_class_name: string;
  alias: string;
  description: string;
  property_name: string;
  intersection: string[];
  creation_status: CreationStatus;
  list_property_keys: string[];
  is_legacy: boolean;
  tag: string;
};

type FeaturesDataSelectResult = {
  feature_id: string;
  the_geom: string;
  properties: Record<string, string | number>;
  source: GeometrySource;
  amount_from_legacy_project: number | null;
  project_pu_id: string | null;
};

@Injectable()
@PieceExportProvider()
export class ProjectCustomFeaturesPieceExporter
  implements ExportPieceProcessor {
  private readonly logger: Logger = new Logger(
    ProjectCustomFeaturesPieceExporter.name,
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

  async run(input: ExportJobInput): Promise<ExportJobOutput> {
    const customFeatures: ProjectCustomFeaturesSelectResult[] = await this.apiEntityManager
      .createQueryBuilder()
      .select([
        'f.id',
        'f.feature_class_name',
        'f.alias',
        'f.description',
        'f.property_name',
        'f.intersection',
        'f.creation_status',
        'f.list_property_keys',
        'f.is_legacy',
        'pft.tag',
      ])
      .from('features', 'f')
      .leftJoin('project_feature_tags', 'pft', 'pft.feature_id = f.id')
      .where('f.project_id = :projectId', { projectId: input.resourceId })
      .execute();

    const customFeaturesIds = customFeatures.map((feature) => feature.id);
    let customFeaturesData: FeaturesDataSelectResult[] = [];
    let projectPusMap: Record<string, number> = {};
    if (customFeaturesIds.length > 0) {
      customFeaturesData = await this.geoprocessingEntityManager
        .createQueryBuilder()
        .select([
          'feature_id',
          'the_geom',
          'properties',
          'source',
          'amount_from_legacy_project',
          'project_pu_id',
        ])
        .from('features_data', 'fd')
        .where('feature_id IN (:...customFeaturesIds)', {
          customFeaturesIds,
        })
        .execute();

      projectPusMap = await this.getProjectPusMap(input.resourceId);
    }

    const fileContent: ProjectCustomFeaturesContent = {
      features: customFeatures.map(({ id, ...feature }) => ({
        ...feature,
        data: customFeaturesData
          .filter((data) => data.feature_id === id)
          .map(({ feature_id, project_pu_id, ...data }) => {
            const puid = project_pu_id
              ? projectPusMap[project_pu_id]
              : undefined;
            return { projectPuPuid: puid, ...data };
          }),
      })),
    };

    const relativePath = ClonePieceRelativePathResolver.resolveFor(
      ClonePiece.ProjectCustomFeatures,
    );

    const outputFile = await this.fileRepository.saveCloningFile(
      input.exportId,
      Readable.from(JSON.stringify(fileContent)),
      relativePath,
    );

    if (isLeft(outputFile)) {
      const errorMessage = `${ProjectCustomFeaturesPieceExporter.name} - Project Custom Features - couldn't save file - ${outputFile.left.description}`;
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
