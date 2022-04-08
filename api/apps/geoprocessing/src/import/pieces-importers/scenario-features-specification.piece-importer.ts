import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ClonePiece, ImportJobInput, ImportJobOutput } from '@marxan/cloning';
import {
  FeatureIdCalculated,
  FeatureNumberCalculated,
  parseFeatureIdInObject,
  ScenarioFeaturesSpecificationContent,
  ScenarioFeaturesSpecificationContentWithId,
  searchFeatureIdInObject,
} from '@marxan/cloning/infrastructure/clone-piece-data/scenario-features-specification';
import { ScenarioFeaturesData } from '@marxan/features';
import { FileRepository } from '@marxan/files-repository';
import { extractFile, isDefined } from '@marxan/utils';
import { Injectable, Logger } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { isLeft } from 'fp-ts/lib/Either';
import { EntityManager } from 'typeorm';
import { v4 } from 'uuid';
import {
  ImportPieceProcessor,
  PieceImportProvider,
} from '../pieces/import-piece-processor';

type ScenarioFeaturesDataResult = { id: string; featureId: number };
type SpecificationIdByFeatureId = Record<number, string>;
type ScenarioFeaturesDataByFeatureId = Record<
  number,
  ScenarioFeaturesDataResult
>;
type FeaturesSelectResult = { id: string; name: string };

type FeatureNames = {
  customFeaturesNames: string[];
  platformFeaturesNames: string[];
};

@Injectable()
@PieceImportProvider()
export class ScenarioFeaturesSpecificationPieceImporter
  implements ImportPieceProcessor {
  constructor(
    private readonly fileRepository: FileRepository,
    @InjectEntityManager(geoprocessingConnections.apiDB)
    private readonly apiEntityManager: EntityManager,
    @InjectEntityManager(geoprocessingConnections.default)
    private readonly geoprocessingEntityManager: EntityManager,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(ScenarioFeaturesSpecificationPieceImporter.name);
  }

  isSupported(piece: ClonePiece): boolean {
    return piece === ClonePiece.FeaturesSpecification;
  }

  private getScenarioFeaturesData(
    scenarioId: string,
  ): Promise<ScenarioFeaturesDataResult[]> {
    return this.geoprocessingEntityManager
      .createQueryBuilder()
      .select('id')
      .addSelect('feature_id', 'featureId')
      .from(ScenarioFeaturesData, 'sfd')
      .where('scenario_id = :scenarioId', { scenarioId })
      .execute();
  }

  private getScenarioFeaturesDataByFeatureId(
    scenarioFeaturesData: ScenarioFeaturesDataResult[],
  ) {
    const scenarioFeaturesDataByFeatureId: ScenarioFeaturesDataByFeatureId = {};

    scenarioFeaturesData.forEach(
      ({ id, featureId }) =>
        (scenarioFeaturesDataByFeatureId[featureId] = { id, featureId }),
    );

    return scenarioFeaturesDataByFeatureId;
  }

  private async insertSpecificationFeaturesConfig(
    parsedSpecifications: ScenarioFeaturesSpecificationContentWithId[],
    apiEm: EntityManager,
  ) {
    return Promise.all(
      parsedSpecifications.flatMap((specification) => {
        const configs = specification.configs;
        const specificationId = specification.id;
        return configs.map(
          ({
            baseFeatureId,
            againstFeatureId,
            features,
            featuresDetermined,
            operation,
            selectSubSets,
            splitByProperty,
          }) => {
            return apiEm
              .createQueryBuilder()
              .insert()
              .into('specification_feature_configs')
              .values({
                specification_id: specificationId,
                base_feature_id: baseFeatureId,
                against_feature_id: againstFeatureId,
                operation,
                features_determined: featuresDetermined,
                split_by_property: splitByProperty,
                select_sub_sets: !selectSubSets
                  ? null
                  : JSON.stringify(selectSubSets),
                features: JSON.stringify(features),
              })
              .execute();
          },
        );
      }),
    );
  }

  private getFeaturesFromSpecifications(
    specifications: ScenarioFeaturesSpecificationContent[],
  ): { platformFeaturesNames: string[]; customFeaturesNames: string[] } {
    const raws = specifications.map((specification) => specification.raw);
    const filteredRaws = raws.filter((raw) => isDefined(raw));
    const results: string[] = [];
    filteredRaws.forEach((raw) => searchFeatureIdInObject(raw, results));

    const configFeatures = specifications
      .flatMap((specification) => {
        return specification.configs;
      })
      .flatMap((config) => {
        if (isDefined(config.againstFeature))
          return [config.baseFeature, config.againstFeature];
        return [config.baseFeature];
      });

    results.push(...configFeatures);
    const uniqueFeaturesNameAndProject = [...new Set(results)];

    return {
      customFeaturesNames: uniqueFeaturesNameAndProject
        .filter((nameAndProject) => nameAndProject.endsWith('/project'))
        .map((feature) => feature.substring(0, feature.lastIndexOf('/'))),
      platformFeaturesNames: uniqueFeaturesNameAndProject
        .filter((nameAndProject) => nameAndProject.endsWith('/platform'))
        .map((feature) => feature.substring(0, feature.lastIndexOf('/'))),
    };
  }

  private async getFeaturesIdByNameAndProject(
    featuresNames: FeatureNames,
    projectId: string,
  ) {
    const { customFeaturesNames, platformFeaturesNames } = featuresNames;
    let customFeaturesWithId: FeaturesSelectResult[] = [];
    let platformFeaturesWithId: FeaturesSelectResult[] = [];
    if (customFeaturesNames.length > 0) {
      customFeaturesWithId = await this.apiEntityManager
        .createQueryBuilder()
        .select('id')
        .addSelect('feature_class_name', 'name')
        .from('features', 'f')
        .where('feature_class_name IN (:...customFeaturesNames)', {
          customFeaturesNames,
        })
        .andWhere('project_id = :projectId', { projectId })
        .execute();
    }

    if (platformFeaturesNames.length > 0) {
      platformFeaturesWithId = await this.apiEntityManager
        .createQueryBuilder()
        .select('id')
        .addSelect('feature_class_name', 'name')
        .from('features', 'f')
        .where('feature_class_name IN (:...platformFeaturesNames)', {
          platformFeaturesNames,
        })
        .andWhere('project_id IS NULL')
        .execute();
    }

    const featuresIdByNameAndProject: Record<string, string> = {};

    platformFeaturesWithId.forEach(
      (feature) =>
        (featuresIdByNameAndProject[`${feature.name}/platform`] = feature.id),
    );
    customFeaturesWithId.forEach(
      (feature) =>
        (featuresIdByNameAndProject[`${feature.name}/project`] = feature.id),
    );
    return featuresIdByNameAndProject;
  }

  private parseFeatureId(
    feature: string,
    featutesIdByNameAndProjectMap: Record<string, string>,
  ) {
    const result = featutesIdByNameAndProjectMap[feature];
    if (!result)
      throw new Error('could not find exported feature in target system');
    return result;
  }

  private parseRaw(
    raw: Record<string, any>,
    featutesIdByNameAndProjectMap: Record<string, string>,
  ) {
    if (isDefined(raw))
      parseFeatureIdInObject(raw, (featureNamAndProject: string) =>
        this.parseFeatureId(
          featureNamAndProject,
          featutesIdByNameAndProjectMap,
        ),
      );
  }

  private parseFeaturesNumberCalculated(
    features: FeatureNumberCalculated[],
    scenarioFeaturesDataByFeatureId: ScenarioFeaturesDataByFeatureId,
  ): FeatureIdCalculated[] {
    return features.map(({ featureId, calculated }) => {
      const feature = scenarioFeaturesDataByFeatureId[featureId];
      if (!feature)
        throw new Error('cant find asociated scenario feature data');
      return {
        calculated,
        featureId: feature.id,
      };
    });
  }

  private async parseFileContent(
    specifications: ScenarioFeaturesSpecificationContent[],
    scenarioFeaturesDataByFeatureId: ScenarioFeaturesDataByFeatureId,
    projectId: string,
  ): Promise<{
    parsedSpecifications: ScenarioFeaturesSpecificationContentWithId[];
    specificationIdByFeatureId: SpecificationIdByFeatureId;
  }> {
    const featuresNames = this.getFeaturesFromSpecifications(specifications);

    const featutesIdByNameAndProjectMap = await this.getFeaturesIdByNameAndProject(
      featuresNames,
      projectId,
    );
    const specificationIdByFeatureId: Record<number, string> = {};

    const parsedSpecifications = specifications.map(
      ({ draft, raw, configs }) => {
        const specificationId = v4();

        this.parseRaw(raw, featutesIdByNameAndProjectMap);

        const parsedConfigs = configs.map(
          ({ baseFeature, againstFeature, features, ...rest }) => {
            features.forEach(({ featureId }) => {
              specificationIdByFeatureId[featureId] = specificationId;
            });
            return {
              ...rest,
              baseFeatureId: this.parseFeatureId(
                baseFeature,
                featutesIdByNameAndProjectMap,
              ),
              againstFeatureId: isDefined(againstFeature)
                ? this.parseFeatureId(
                    againstFeature,
                    featutesIdByNameAndProjectMap,
                  )
                : null,
              features: this.parseFeaturesNumberCalculated(
                features,
                scenarioFeaturesDataByFeatureId,
              ),
            };
          },
        );

        return {
          id: specificationId,
          draft,
          raw,
          configs: parsedConfigs,
        };
      },
    );
    return { parsedSpecifications, specificationIdByFeatureId };
  }

  async run(input: ImportJobInput): Promise<ImportJobOutput> {
    const { projectId, pieceResourceId: scenarioId, uris, piece } = input;

    if (uris.length !== 1) {
      const errorMessage = `uris array has an unexpected amount of elements: ${uris.length}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }
    const [scenarioFeaturesSpecificationLocation] = uris;

    const readableOrError = await this.fileRepository.get(
      scenarioFeaturesSpecificationLocation.uri,
    );

    if (isLeft(readableOrError)) {
      const errorMessage = `File with piece data for ${piece}/${scenarioId} is not available at ${scenarioFeaturesSpecificationLocation.uri}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    const specificationaOrError = await extractFile(
      readableOrError.right,
      scenarioFeaturesSpecificationLocation.relativePath,
    );

    if (isLeft(specificationaOrError)) {
      const errorMessage = `Scenario features specification file extraction failed: ${scenarioFeaturesSpecificationLocation.relativePath}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    const specifications: ScenarioFeaturesSpecificationContent[] = JSON.parse(
      specificationaOrError.right,
    );
    if (!specifications.length)
      return {
        importId: input.importId,
        componentId: input.componentId,
        pieceResourceId: scenarioId,
        projectId,
        piece: input.piece,
      };

    const scenarioFeaturesData = await this.getScenarioFeaturesData(scenarioId);

    const scenarioFeaturesDataByFeatureId = this.getScenarioFeaturesDataByFeatureId(
      scenarioFeaturesData,
    );

    const {
      parsedSpecifications,
      specificationIdByFeatureId,
    } = await this.parseFileContent(
      specifications,
      scenarioFeaturesDataByFeatureId,
      projectId,
    );

    await this.apiEntityManager.transaction(async (apiEm) => {
      await Promise.all(
        parsedSpecifications.map(({ id, draft, raw }) => {
          apiEm
            .createQueryBuilder()
            .insert()
            .into('specifications')
            .values({ id, scenario_id: scenarioId, draft, raw })
            .execute();
        }),
      );

      await this.insertSpecificationFeaturesConfig(parsedSpecifications, apiEm);

      await this.geoprocessingEntityManager
        .getRepository(ScenarioFeaturesData)
        .save(
          scenarioFeaturesData.map(({ id, featureId }) => ({
            id,
            specificationId: specificationIdByFeatureId[featureId],
          })),
        );
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
