import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ClonePiece, ExportJobInput, ExportJobOutput } from '@marxan/cloning';
import { ComponentLocation, ResourceKind } from '@marxan/cloning/domain';
import { ClonePieceRelativePathResolver } from '@marxan/cloning/infrastructure/clone-piece-data';
import {
  ProjectCustomFeature,
  ProjectCustomFeaturesContent,
} from '@marxan/cloning/infrastructure/clone-piece-data/project-custom-features';
import { FeatureTag } from '@marxan/features';
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

type CreationStatus = ProjectCustomFeature['creation_status'];

type ProjectCustomFeaturesSelectResult = {
  id: string;
  feature_class_name: string;
  alias: string;
  description: string;
  property_name: string;
  intersection: string[];
  tag: FeatureTag;
  creation_status: CreationStatus;
  list_property_keys: string[];
  is_legacy: boolean;
};

type FeaturesDataSelectResult = {
  feature_id: string;
  the_geom: string;
  properties: Record<string, string | number>;
  source: GeometrySource;
};

@Injectable()
@PieceExportProvider()
export class ProjectCustomFeaturesPieceExporter
  implements ExportPieceProcessor {
  constructor(
    private readonly fileRepository: CloningFilesRepository,
    @InjectEntityManager(geoprocessingConnections.apiDB)
    private readonly apiEntityManager: EntityManager,
    @InjectEntityManager(geoprocessingConnections.default)
    private readonly geoprocessingEntityManager: EntityManager,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(ProjectCustomFeaturesPieceExporter.name);
  }

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
        'id',
        'feature_class_name',
        'alias',
        'description',
        'property_name',
        'intersection',
        'tag',
        'creation_status',
        'list_property_keys',
        'is_legacy',
      ])
      .from('features', 'f')
      .where('project_id = :projectId', { projectId: input.resourceId })
      .execute();

    const customFeaturesIds = customFeatures.map((feature) => feature.id);
    let customFeaturesData: FeaturesDataSelectResult[] = [];
    if (customFeaturesIds.length > 0) {
      customFeaturesData = await this.geoprocessingEntityManager
        .createQueryBuilder()
        .select(['feature_id', 'the_geom', 'properties', 'source'])
        .from('features_data', 'fd')
        .where('feature_id IN (:...customFeaturesIds)', {
          customFeaturesIds,
        })
        .execute();
    }

    const fileContent: ProjectCustomFeaturesContent = {
      features: customFeatures.map(({ id, ...feature }) => ({
        ...feature,
        data: customFeaturesData
          .filter((data) => data.feature_id === id)
          .map(({ feature_id, ...data }) => data),
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
}
