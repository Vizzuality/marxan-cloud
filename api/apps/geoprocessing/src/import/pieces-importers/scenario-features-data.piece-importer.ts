import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ClonePiece, ImportJobInput, ImportJobOutput } from '@marxan/cloning';
import {
  FeatureDataElement,
  ScenarioFeaturesDataContent,
} from '@marxan/cloning/infrastructure/clone-piece-data/scenario-features-data';
import { ScenarioFeaturesData } from '@marxan/features';
import { CloningFilesRepository } from '@marxan/cloning-files-repository';
import { GeoFeatureGeometry } from '@marxan/geofeatures';
import { OutputScenariosFeaturesDataGeoEntity } from '@marxan/marxan-output';
import { extractFile } from '@marxan/utils';
import { Injectable, Logger } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { isLeft } from 'fp-ts/lib/Either';
import { DeepPartial, EntityManager } from 'typeorm';
import { v4 } from 'uuid';
import {
  ImportPieceProcessor,
  PieceImportProvider,
} from '../pieces/import-piece-processor';
import { chunk } from 'lodash';

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

const CHUNK_SIZE = 100;

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

  private getUniqueFeaturesNames(featuresData: FeatureDataElement[]): string[] {
    const uniqueNames = new Set<string>();
    featuresData.forEach((feature) => {
      uniqueNames.add(feature.featureClassName);
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
    featureIdsByClassNameMap: FeatureIdByClassNameMap,
  ): string[] {
    return featuresData.map(
      (feature) =>
        `${featureIdsByClassNameMap[feature.featureClassName]}/${
          feature.featureDataHash
        }`,
    );
  }

  private async getFeatureDataIdByFeatureIdAndHashMap(
    fileContent: ScenarioFeaturesDataContent,
    featureIdsByClassNameMaps: FeatureIdByClassNameMaps,
  ): Promise<FeatureDataIdByFeatureIdAndHashMap> {
    const featureIdAndHashes = [
      ...this.getFeatureIdsAndHashes(
        fileContent.customFeaturesData,
        featureIdsByClassNameMaps.customFeaturesMap,
      ),
      ...this.getFeatureIdsAndHashes(
        fileContent.platformFeaturesData,
        featureIdsByClassNameMaps.platformFeaturesMap,
      ),
    ];

    let featureData: FeatureDataSelectResult[] = [];

    if (featureIdAndHashes.length > 0) {
      featureData = await this.geoEntityManager
        .createQueryBuilder()
        .select('id', 'featureDataId')
        .addSelect(`feature_id || '/' || hash`, 'featureIdAndHash')
        .from(GeoFeatureGeometry, 'fd')
        .where(`feature_id || '/' || hash IN (:...featureIdAndHashes)`, {
          featureIdAndHashes,
        })
        .execute();
    }

    const map: FeatureDataIdByFeatureIdAndHashMap = {};
    featureData.forEach(({ featureDataId, featureIdAndHash }) => {
      map[featureIdAndHash] = featureDataId;
    });

    return map;
  }

  private getScenarioFeaturesDataInsertValues(
    featureData: FeatureDataElement[],
    featureIdByClassNameMap: FeatureIdByClassNameMap,
    featureDataIdByFeatureIdAndHashMap: FeatureDataIdByFeatureIdAndHashMap,
    scenarioId: string,
  ) {
    const outputScenariosFeatureData: DeepPartial<OutputScenariosFeaturesDataGeoEntity>[] = [];
    const insertValues = featureData.map(
      ({ featureClassName, featureDataHash, outputFeaturesData, ...rest }) => {
        const featureId = featureIdByClassNameMap[featureClassName];
        const featureDataId =
          featureDataIdByFeatureIdAndHashMap[`${featureId}/${featureDataHash}`];
        const scenarioFeatureDataId = v4();

        if (outputFeaturesData.length > 0)
          outputScenariosFeatureData.push(
            ...outputFeaturesData.map((record) => ({
              ...record,
              featureScenarioId: scenarioFeatureDataId,
            })),
          );

        return {
          ...rest,
          featureDataId,
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

    const stringScenarioFeaturesDataOrError = await extractFile(
      readableOrError.right,
      scenarioFeaturesDataLocation.relativePath,
    );
    if (isLeft(stringScenarioFeaturesDataOrError)) {
      const errorMessage = `Scenario features data file extraction failed: ${scenarioFeaturesDataLocation.relativePath}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    const content: ScenarioFeaturesDataContent = JSON.parse(
      stringScenarioFeaturesDataOrError.right,
    );
    const customFeaturesName = this.getUniqueFeaturesNames(
      content.customFeaturesData,
    );
    const platformFeaturesName = this.getUniqueFeaturesNames(
      content.platformFeaturesData,
    );

    const featureIdByClassNameMaps = await this.getFeatureIdByClassNameMaps(
      projectId,
      customFeaturesName,
      platformFeaturesName,
    );

    const featureDataIdByFeatureIdAndHashMap = await this.getFeatureDataIdByFeatureIdAndHashMap(
      content,
      featureIdByClassNameMaps,
    );

    await this.geoEntityManager.transaction(async (em) => {
      const scenarioFeaturesDataRepo = em.getRepository(ScenarioFeaturesData);
      const outputScenariosFeatureDataRepo = em.getRepository(
        OutputScenariosFeaturesDataGeoEntity,
      );
      const customFeaturesInsertValues = this.getScenarioFeaturesDataInsertValues(
        content.customFeaturesData,
        featureIdByClassNameMaps.customFeaturesMap,
        featureDataIdByFeatureIdAndHashMap,
        scenarioId,
      );
      const platformFeaturesInsertValues = this.getScenarioFeaturesDataInsertValues(
        content.platformFeaturesData,
        featureIdByClassNameMaps.platformFeaturesMap,
        featureDataIdByFeatureIdAndHashMap,
        scenarioId,
      );

      const scenarioFeaturesDataToInsert = customFeaturesInsertValues.scenarioFeaturesData.concat(
        platformFeaturesInsertValues.scenarioFeaturesData,
      );

      const outputScenariosFeaturesDataToInsert = customFeaturesInsertValues.outputScenariosFeatureData.concat(
        platformFeaturesInsertValues.outputScenariosFeatureData,
      );

      for (const data of chunk(scenarioFeaturesDataToInsert, CHUNK_SIZE)) {
        await scenarioFeaturesDataRepo.save(data);
      }
      for (const data of chunk(
        outputScenariosFeaturesDataToInsert,
        CHUNK_SIZE,
      )) {
        await outputScenariosFeatureDataRepo.save(data);
      }
    });

    return {
      importId: input.importId,
      componentId: input.componentId,
      pieceResourceId: scenarioId,
      projectId,
      piece: input.piece,
    };
  }
}
