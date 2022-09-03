import { CHUNK_SIZE_FOR_BATCH_GEODB_OPERATIONS } from '@marxan-geoprocessing/utils/chunk-size-for-batch-geodb-operations';
import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ClonePiece, ImportJobInput, ImportJobOutput } from '@marxan/cloning';
import { CloningFilesRepository } from '@marxan/cloning-files-repository';
import {
  FeatureDataElement,
  ScenarioFeaturesDataContent,
} from '@marxan/cloning/infrastructure/clone-piece-data/scenario-features-data';
import { ScenarioFeaturesData } from '@marxan/features';
import { GeoFeatureGeometry } from '@marxan/geofeatures';
import { OutputScenariosFeaturesDataGeoEntity } from '@marxan/marxan-output';
import { readableToBuffer } from '@marxan/utils';
import { Injectable, Logger } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { isLeft } from 'fp-ts/lib/Either';
import { chunk } from 'lodash';
import { DeepPartial, EntityManager } from 'typeorm';
import { v4 } from 'uuid';
import {
  ImportPieceProcessor,
  PieceImportProvider,
} from '../pieces/import-piece-processor';

type FeatureIdByClassNameMap = Record<string, string>;

type FeatureIdByClassNameMaps = {
  customFeaturesMap: FeatureIdByClassNameMap;
  platformFeaturesMap: FeatureIdByClassNameMap;
};

type FeatureDataIdByFeatureIdAndHashMap = Record<string, string>;

type FeatureDataSelectResult = {
  featureDataId: string;
  featureIdAndHash: string;
};

type FeatureSelectResult = {
  id: string;
  feature_class_name: string;
};

@Injectable()
@PieceImportProvider()
export class ScenarioFeaturesDataPieceImporter implements ImportPieceProcessor {
  constructor(
    private readonly fileRepository: CloningFilesRepository,
    @InjectEntityManager(geoprocessingConnections.apiDB)
    private readonly apiEntityManager: EntityManager,
    @InjectEntityManager(geoprocessingConnections.default)
    private readonly geoEntityManager: EntityManager,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(ScenarioFeaturesDataPieceImporter.name);
  }

  isSupported(piece: ClonePiece): boolean {
    return piece === ClonePiece.ScenarioFeaturesData;
  }

  private getUniqueFeaturesNames(
    featuresData: FeatureDataElement[],
    opts: { isCustom: boolean },
  ): string[] {
    const uniqueNames = new Set<string>();
    featuresData.forEach(({ apiFeature, featureDataFeature }) => {
      if (apiFeature.isCustom === opts.isCustom)
        uniqueNames.add(apiFeature.featureClassName);
      if (featureDataFeature.isCustom === opts.isCustom)
        uniqueNames.add(featureDataFeature.featureClassName);
    });

    return Array.from(uniqueNames);
  }

  private ensureFeaturesWereFound(expected: string[], actual: string[]): void {
    const notFound = expected.filter((name) => !actual.includes(name));

    if (notFound.length > 0) {
      throw new Error(`Features not found: ${notFound.join(', ')}`);
    }
  }

  private getFeatureMapByClassName(
    features: FeatureSelectResult[],
  ): FeatureIdByClassNameMap {
    const map: FeatureIdByClassNameMap = {};
    features.forEach((feature) => {
      map[feature.feature_class_name] = feature.id;
    });

    return map;
  }

  private async getFeatureIdByClassNameMaps(
    projectId: string,
    customFeaturesNames: string[],
    platformFeaturesNames: string[],
  ): Promise<FeatureIdByClassNameMaps> {
    let customFeatures: FeatureSelectResult[] = [];
    let platformFeatures: FeatureSelectResult[] = [];

    if (customFeaturesNames.length > 0) {
      customFeatures = await this.apiEntityManager
        .createQueryBuilder()
        .select('id, feature_class_name')
        .from('features', 'f')
        .where('feature_class_name IN (:...customFeaturesNames)', {
          customFeaturesNames,
        })
        .andWhere('project_id = :projectId', { projectId })
        .execute();

      this.ensureFeaturesWereFound(
        customFeaturesNames,
        customFeatures.map((feature) => feature.feature_class_name),
      );
    }

    if (platformFeaturesNames.length > 0) {
      platformFeatures = await this.apiEntityManager
        .createQueryBuilder()
        .select('id, feature_class_name')
        .from('features', 'f')
        .where('feature_class_name IN (:...platformFeaturesNames)', {
          platformFeaturesNames,
        })
        .andWhere('project_id IS NULL')
        .execute();

      this.ensureFeaturesWereFound(
        platformFeaturesNames,
        platformFeatures.map((feature) => feature.feature_class_name),
      );
    }

    return {
      customFeaturesMap: this.getFeatureMapByClassName(customFeatures),
      platformFeaturesMap: this.getFeatureMapByClassName(platformFeatures),
    };
  }

  private getFeatureIdsAndHashes(
    featuresData: FeatureDataElement[],
    { customFeaturesMap, platformFeaturesMap }: FeatureIdByClassNameMaps,
  ): string[] {
    return featuresData.map((feature) => {
      const { isCustom, featureClassName } = feature.featureDataFeature;
      const featureId = isCustom
        ? customFeaturesMap[featureClassName]
        : platformFeaturesMap[featureClassName];

      return `${featureId}/${feature.featureDataHash}`;
    });
  }

  private async getFeatureDataIdByFeatureIdAndHashMap(
    fileContent: FeatureDataElement[],
    featureIdsByClassNameMaps: FeatureIdByClassNameMaps,
  ): Promise<FeatureDataIdByFeatureIdAndHashMap> {
    const featureIdAndHashes = this.getFeatureIdsAndHashes(
      fileContent,
      featureIdsByClassNameMaps,
    );
    let featureData: FeatureDataSelectResult[] = [];

    if (featureIdAndHashes.length > 0) {
      const records = await Promise.all(
        chunk(featureIdAndHashes, CHUNK_SIZE_FOR_BATCH_GEODB_OPERATIONS).map(
          (idAndHashes) =>
            this.geoEntityManager
              .createQueryBuilder()
              .select('id', 'featureDataId')
              .addSelect(`feature_id || '/' || hash`, 'featureIdAndHash')
              .from(GeoFeatureGeometry, 'fd')
              .where(`feature_id || '/' || hash IN (:...idAndHashes)`, {
                idAndHashes,
              })
              .execute(),
        ),
      );
      featureData = records.flat();
    }

    const map: FeatureDataIdByFeatureIdAndHashMap = {};
    featureData.forEach(({ featureDataId, featureIdAndHash }) => {
      map[featureIdAndHash] = featureDataId;
    });

    return map;
  }

  private getScenarioFeaturesDataInsertValues(
    featureData: FeatureDataElement[],
    { customFeaturesMap, platformFeaturesMap }: FeatureIdByClassNameMaps,
    featureDataIdByFeatureIdAndHashMap: FeatureDataIdByFeatureIdAndHashMap,
    scenarioId: string,
  ) {
    const outputScenariosFeatureData: DeepPartial<OutputScenariosFeaturesDataGeoEntity>[] = [];
    const insertValues = featureData.map(
      ({
        apiFeature,
        featureDataFeature,
        featureDataHash,
        outputFeaturesData,
        ...rest
      }) => {
        const featureDataFeatureName = featureDataFeature.featureClassName;
        const featureDataFeatureId = featureDataFeature.isCustom
          ? customFeaturesMap[featureDataFeatureName]
          : platformFeaturesMap[featureDataFeatureName];

        const featureDataId =
          featureDataIdByFeatureIdAndHashMap[
            `${featureDataFeatureId}/${featureDataHash}`
          ];

        const apiFeatureName = apiFeature.featureClassName;
        const apiFeatureId = apiFeature.isCustom
          ? customFeaturesMap[apiFeatureName]
          : platformFeaturesMap[apiFeatureName];

        const scenarioFeatureDataId = v4();

        if (outputFeaturesData.length > 0)
          outputScenariosFeatureData.push(
            ...outputFeaturesData.map((record) => ({
              ...record,
              scenarioFeaturesId: scenarioFeatureDataId,
            })),
          );

        return {
          ...rest,
          featureDataId,
          apiFeatureId,
          scenarioId,
          id: scenarioFeatureDataId,
        };
      },
    );

    return {
      scenarioFeaturesData: insertValues,
      outputScenariosFeatureData,
    };
  }

  async run(input: ImportJobInput): Promise<ImportJobOutput> {
    const { pieceResourceId: scenarioId, projectId, uris, piece } = input;

    try {
      if (uris.length !== 1) {
        const errorMessage = `uris array has an unexpected amount of elements: ${uris.length}`;
        this.logger.error(errorMessage);
        throw new Error(errorMessage);
      }
      const [scenarioFeaturesDataLocation] = uris;

      const readableOrError = await this.fileRepository.get(
        scenarioFeaturesDataLocation.uri,
      );

      if (isLeft(readableOrError)) {
        const errorMessage = `File with piece data for ${piece}/${scenarioId} is not available at ${scenarioFeaturesDataLocation.uri}`;
        this.logger.error(errorMessage);
        throw new Error(errorMessage);
      }

      const buffer = await readableToBuffer(readableOrError.right);
      const stringScenarioFeaturesDataOrError = buffer.toString();

      const { featuresData }: ScenarioFeaturesDataContent = JSON.parse(
        stringScenarioFeaturesDataOrError,
      );

      const customFeaturesName = this.getUniqueFeaturesNames(featuresData, {
        isCustom: true,
      });
      const platformFeaturesName = this.getUniqueFeaturesNames(featuresData, {
        isCustom: false,
      });

      const featureIdByClassNameMaps = await this.getFeatureIdByClassNameMaps(
        projectId,
        customFeaturesName,
        platformFeaturesName,
      );

      const featureDataIdByFeatureIdAndHashMap = await this.getFeatureDataIdByFeatureIdAndHashMap(
        featuresData,
        featureIdByClassNameMaps,
      );

      await this.geoEntityManager.transaction(async (em) => {
        const scenarioFeaturesDataRepo = em.getRepository(ScenarioFeaturesData);
        const outputScenariosFeatureDataRepo = em.getRepository(
          OutputScenariosFeaturesDataGeoEntity,
        );
        const {
          scenarioFeaturesData,
          outputScenariosFeatureData,
        } = this.getScenarioFeaturesDataInsertValues(
          featuresData,
          featureIdByClassNameMaps,
          featureDataIdByFeatureIdAndHashMap,
          scenarioId,
        );

        await scenarioFeaturesDataRepo.save(scenarioFeaturesData, {
          chunk: CHUNK_SIZE_FOR_BATCH_GEODB_OPERATIONS,
        });
        await outputScenariosFeatureDataRepo.save(outputScenariosFeatureData, {
          chunk: CHUNK_SIZE_FOR_BATCH_GEODB_OPERATIONS,
        });
      });
    } catch (e) {
      this.logger.error(e);
      throw e;
    }

    return {
      importId: input.importId,
      componentId: input.componentId,
      pieceResourceId: scenarioId,
      projectId,
      piece: input.piece,
    };
  }
}
