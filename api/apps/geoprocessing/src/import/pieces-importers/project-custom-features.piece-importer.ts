import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ClonePiece, ImportJobInput, ImportJobOutput } from '@marxan/cloning';
import { ResourceKind } from '@marxan/cloning/domain';
import { ProjectCustomFeaturesContent } from '@marxan/cloning/infrastructure/clone-piece-data/project-custom-features';
import { FileRepository } from '@marxan/files-repository';
import { GeoFeatureGeometry } from '@marxan/geofeatures';
import { extractFile } from '@marxan/utils';
import { Injectable, Logger } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { isLeft } from 'fp-ts/lib/Either';
import { EntityManager } from 'typeorm';
import { v4 } from 'uuid';
import {
  ImportPieceProcessor,
  PieceImportProvider,
} from '../pieces/import-piece-processor';

@Injectable()
@PieceImportProvider()
export class ProjectCustomFeaturesPieceImporter
  implements ImportPieceProcessor {
  constructor(
    private readonly fileRepository: FileRepository,
    @InjectEntityManager(geoprocessingConnections.apiDB)
    private readonly apiEntityManager: EntityManager,
    @InjectEntityManager(geoprocessingConnections.default)
    private readonly geoprocessingEntityManager: EntityManager,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(ProjectCustomFeaturesPieceImporter.name);
  }

  isSupported(piece: ClonePiece, kind: ResourceKind): boolean {
    return (
      piece === ClonePiece.ProjectCustomFeatures &&
      kind === ResourceKind.Project
    );
  }

  async run(input: ImportJobInput): Promise<ImportJobOutput> {
    const { uris, pieceResourceId, projectId, piece } = input;

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

    const customProjectFeaturesOrError = await extractFile(
      readableOrError.right,
      customProjectFeaturesLocation.relativePath,
    );
    if (isLeft(customProjectFeaturesOrError)) {
      const errorMessage = `Custom project features file extraction failed: ${customProjectFeaturesLocation.relativePath}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    const { features }: ProjectCustomFeaturesContent = JSON.parse(
      customProjectFeaturesOrError.right,
    );

    const returnValue = {
      importId: input.importId,
      componentId: input.componentId,
      pieceResourceId,
      projectId,
      piece: input.piece,
    };

    if (!features.length) return returnValue;

    await this.apiEntityManager.transaction(async (apiEm) => {
      const featureIdByClassName: Record<string, string> = {};
      const insertValues = features.map(({ data, ...feature }) => {
        const featureId = v4();
        featureIdByClassName[feature.feature_class_name] = featureId;

        return {
          ...feature,
          project_id: projectId,
          id: featureId,
        };
      });

      await Promise.all(
        insertValues.map((values) =>
          apiEm
            .createQueryBuilder()
            .insert()
            .into('features')
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
        ({ feature_class_name, ...data }) => ({
          theGeom: () => `'${data.the_geom}'`,
          properties: data.properties,
          source: data.source,
          featureId: featureIdByClassName[feature_class_name],
        }),
      );

      await this.geoprocessingEntityManager
        .createQueryBuilder()
        .insert()
        .into(GeoFeatureGeometry)
        .values(featuresDataInsertValues)
        .execute();
    });

    return returnValue;
  }
}
