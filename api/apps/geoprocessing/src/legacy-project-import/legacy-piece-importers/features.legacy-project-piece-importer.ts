import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import {
  LegacyProjectImportFilesRepository,
  LegacyProjectImportFileType,
  LegacyProjectImportJobInput,
  LegacyProjectImportJobOutput,
  LegacyProjectImportPiece,
} from '@marxan/legacy-project-import';
import { readableToBuffer } from '@marxan/utils';
import { Injectable, Logger } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { string } from 'fp-ts';
import { isLeft } from 'fp-ts/lib/Either';
import { EntityManager } from 'typeorm';
import { v4 } from 'uuid';
import {
  LegacyProjectImportPieceProcessor,
  LegacyProjectImportPieceProcessorProvider,
} from '../pieces/legacy-project-import-piece-processor';

type SpecDataEntry = {
  id: string;
  prop: string;
  name?: string;
  target?: string;
};

type LegacyFeatureTypeContent = {
  features: SpecDataEntry[];
};

type PuvsprDataEntry = {
  species: string;
  pu: string;
  amount: string;
};

type LegacyPuFeatureTypeContent = {
  puAndFeatures: PuvsprDataEntry[];
};

@Injectable()
@LegacyProjectImportPieceProcessorProvider()
export class FeaturesLegacyProjectPieceImporter
  implements LegacyProjectImportPieceProcessor {
  constructor(
    private readonly filesRepo: LegacyProjectImportFilesRepository,
    @InjectEntityManager(geoprocessingConnections.apiDB)
    private readonly apiEntityManager: EntityManager,
    @InjectEntityManager(geoprocessingConnections.default)
    private readonly geoprocessingEntityManager: EntityManager,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(FeaturesLegacyProjectPieceImporter.name);
  }

  isSupported(piece: LegacyProjectImportPiece): boolean {
    return piece === LegacyProjectImportPiece.Features;
  }

  async run(
    input: LegacyProjectImportJobInput,
  ): Promise<LegacyProjectImportJobOutput> {
    const { pieceId, files, projectId, scenarioId, piece } = input;

    const specFeaturesFileOrError = files.find(
      (file) => file.type === LegacyProjectImportFileType.SpecDat,
    );

    if (!specFeaturesFileOrError) {
      throw new Error('Shapefile not found inside input file array');
    }

    const specFileReadableOrError = await this.filesRepo.get(
      specFeaturesFileOrError.location,
    );

    if (isLeft(specFileReadableOrError)) {
      throw new Error(
        'Features cannot be retrieved from legacy project import files repository',
      );
    }

    const specBuffer = await readableToBuffer(specFileReadableOrError.right);
    const legacyProjectFeaturesOrError = specBuffer.toString();

    const { features }: LegacyFeatureTypeContent = JSON.parse(
      legacyProjectFeaturesOrError,
    );

    // const specFeaturesFileOrError = files.find(
    //   (file) => file.type === LegacyProjectImportFileType.SpecDat,
    // );

    // if (!puvsprFeaturesFileOrError) {
    //   throw new Error('Shapefile not found inside input file array');
    // }

    // const puvsprFileReadableOrError = await this.filesRepo.get(
    //   puvsprFeaturesFileOrError.location,
    // );

    // if (isLeft(puvsprFileReadableOrError)) {
    //   throw new Error(
    //     'Features cannot be retrieved from legacy project import files repository',
    //   );
    // }

    // const buffer = await readableToBuffer(puvsprFileReadableOrError.right);
    // const puFeaturesLinkReadableOrError = buffer.toString();

    // const { puAndFeatures }: LegacyPuFeatureTypeContent = JSON.parse(
    //   puFeaturesLinkReadableOrError,
    // );

    await this.apiEntityManager.transaction(async (apiEm) => {
      const featureIdByClassName: Record<string, string> = {};
      const insertValues = features.map((feature) => {
        if (feature.target) {
          throw new Error(
            'Target is not supported, please translate target to prop value',
          );
        }
        const featureId = v4();

        return {
          ...feature,
          project_id: projectId,
          featureIntegerId: feature.id,
          id: featureId,
          feature_class_name: feature.name,
          is_custom: true,
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

      // featureId + puId + amount
      // featureIntegerId

      // const featuresData = features.flatMap((feature) =>
      //   feature.data.map((data) => ({
      //     ...data,
      //     feature_class_name: feature.feature_class_name,
      //   })),
      // );

      // const featuresDataInsertValues = featuresData.map(
      //   ({ feature_class_name, ...data }) => ({
      //     theGeom: () => `'${data.the_geom}'`,
      //     properties: data.properties,
      //     source: data.source,
      //     featureId: featureIdByClassName[feature_class_name],
      //   }),
      // );

      // const chunkSize = 1000;
      // await Promise.all(
      //   chunk(featuresDataInsertValues, chunkSize).map((values) =>
      //     this.geoprocessingEntityManager
      //       .createQueryBuilder()
      //       .insert()
      //       .into(GeoFeatureGeometry)
      //       .values(values)
      //       .execute(),
      //   ),
      // );
    });

    return input;
  }
}
