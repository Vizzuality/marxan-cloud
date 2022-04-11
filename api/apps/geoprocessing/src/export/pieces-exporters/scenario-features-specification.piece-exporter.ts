import { SpecificationOperation } from '@marxan-api/modules/specification';
import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { ClonePiece, ExportJobInput, ExportJobOutput } from '@marxan/cloning';
import { ClonePieceUrisResolver } from '@marxan/cloning/infrastructure/clone-piece-data';
import {
  FeatureIdCalculated,
  FeaturesConfig,
  parseFeatureIdInObject,
  ScenarioFeaturesSpecificationContent,
  searchFeatureIdInObject,
} from '@marxan/cloning/infrastructure/clone-piece-data/scenario-features-specification';
import { ScenarioFeaturesData } from '@marxan/features/scenario-features-data.geo.entity';
import { FileRepository } from '@marxan/files-repository';
import { isDefined } from '@marxan/utils';
import { Injectable, Logger } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { isLeft } from 'fp-ts/lib/Either';
import { Readable } from 'stream';
import { In, Repository } from 'typeorm';
import { EntityManager } from 'typeorm/entity-manager/EntityManager';
import {
  ExportPieceProcessor,
  PieceExportProvider,
} from '../pieces/export-piece-processor';

type SelectFeaturesResult = {
  id: string;
  feature_class_name: string;
  is_custom: boolean;
};

type SelectSpecificationsResult = {
  id: string;
  draft: boolean;
  raw: Record<string, unknown>;
};

type ScenarioFeaturesDataById = Record<string, ScenarioFeaturesData>;

type SelectScenarioFeaturesConfigs = {
  specificationId: string;
  baseFeatureId: string;
  againstFeatureId: string | null;
  operation: SpecificationOperation;
  featuresDetermined: boolean;
  splitByProperty: string | null;
  selectSubSets: FeaturesConfig['selectSubSets'];
  features: FeatureIdCalculated[];
};
type ScenarioFeaturesConfigsBySpecificationId = Record<
  string,
  FeaturesConfig[]
>;
type FeaturesById = Record<string, string>;

@Injectable()
@PieceExportProvider()
export class ScenarioFeaturesSpecificationPieceExporter
  implements ExportPieceProcessor {
  constructor(
    private readonly fileRepository: FileRepository,
    @InjectEntityManager(geoprocessingConnections.apiDB)
    private readonly apiEntityManager: EntityManager,
    @InjectRepository(ScenarioFeaturesData)
    private readonly scenarioFeaturesDataRepo: Repository<ScenarioFeaturesData>,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(ScenarioFeaturesSpecificationPieceExporter.name);
  }

  isSupported(piece: ClonePiece): boolean {
    return piece === ClonePiece.FeaturesSpecification;
  }

  private async getFeaturesById(featuresIds: string[]): Promise<FeaturesById> {
    const featuresById: FeaturesById = {};

    if (!featuresIds.length) return featuresById;

    const features: SelectFeaturesResult[] = await this.apiEntityManager
      .createQueryBuilder()
      .select(['id', 'feature_class_name', 'is_custom'])
      .from('features', 'f')
      .where('id IN (:...featuresIds)', {
        featuresIds: featuresIds,
      })
      .execute();

    features.forEach((feature) => {
      const { feature_class_name, is_custom } = feature;
      const value = is_custom ? 'project' : 'platform';
      featuresById[feature.id] = `${feature_class_name}/${value}`;
    });
    return featuresById;
  }

  private async getFeaturesByIdFromRaw(raws: Record<string, any>[]) {
    const filteredRaws = raws.filter((raw) => isDefined(raw));
    const results: string[] = [];
    filteredRaws.forEach((raw) => searchFeatureIdInObject(raw, results));
    return this.getFeaturesById([...new Set(results)]);
  }

  private parseRawContent(
    raw: Record<string, any>,
    featuresById: FeaturesById,
  ) {
    if (isDefined(raw)) {
      parseFeatureIdInObject(
        raw,
        (featureId: string) => featuresById[featureId],
      );
    }
    return raw;
  }

  private getScenarioFeaturesDataById(
    scenarioFeaturesData: ScenarioFeaturesData[],
  ) {
    const scenarioFeaturesDataById: ScenarioFeaturesDataById = {};

    scenarioFeaturesData.forEach((feature) => {
      scenarioFeaturesDataById[feature.id] = feature;
    });

    return scenarioFeaturesDataById;
  }

  private async getScenarioFeatureConfigsBySpecificationId(
    scenarioFeatureConfigs: SelectScenarioFeaturesConfigs[],
    scenarioFeaturesDataById: ScenarioFeaturesDataById,
  ): Promise<ScenarioFeaturesConfigsBySpecificationId> {
    const scenarioFeatureConfigsBySpecificationId: ScenarioFeaturesConfigsBySpecificationId = {};
    const featuresIds = new Set(
      scenarioFeatureConfigs.flatMap((config) => {
        if (!isDefined(config.againstFeatureId)) return [config.baseFeatureId];
        return [config.baseFeatureId, config.againstFeatureId];
      }),
    );
    const featuresById = await this.getFeaturesById(Array.from(featuresIds));

    scenarioFeatureConfigs.forEach((config) => {
      const result = {
        againstFeature: !isDefined(config.againstFeatureId)
          ? null
          : featuresById[config.againstFeatureId],
        baseFeature: featuresById[config.baseFeatureId],
        featuresDetermined: config.featuresDetermined,
        operation: config.operation,
        selectSubSets: config.selectSubSets,
        splitByProperty: config.splitByProperty,
        features: config.features.map(({ calculated, featureId }) => ({
          featureId: scenarioFeaturesDataById[featureId].featureId,
          calculated,
        })),
      };
      const temp =
        scenarioFeatureConfigsBySpecificationId[config.specificationId];
      if (temp) temp.push(result);
      else
        scenarioFeatureConfigsBySpecificationId[config.specificationId] = [
          result,
        ];
    });
    return scenarioFeatureConfigsBySpecificationId;
  }

  async run(input: ExportJobInput): Promise<ExportJobOutput> {
    const specifications: SelectSpecificationsResult[] = await this.apiEntityManager
      .createQueryBuilder()
      .select('id')
      .addSelect('draft')
      .addSelect('raw')
      .from('specifications', 's')
      .where('scenario_id = :scenarioId', { scenarioId: input.resourceId })
      .execute();
    const specificationIds = specifications.map(
      (specification) => specification.id,
    );
    let fileContent: ScenarioFeaturesSpecificationContent[] = [];

    if (specifications.length) {
      const scenarioFeaturesData = await this.scenarioFeaturesDataRepo.find({
        where: {
          specificationId: In(specificationIds),
          scenarioId: input.resourceId,
        },
        relations: ['featureData'],
      });

      const scenarioFeaturesDataById = this.getScenarioFeaturesDataById(
        scenarioFeaturesData,
      );

      const scenarioFeatureConfigs: SelectScenarioFeaturesConfigs[] = await this.apiEntityManager
        .createQueryBuilder()
        .select('specification_id', 'specificationId')
        .addSelect('base_feature_id', 'baseFeatureId')
        .addSelect('against_feature_id', 'againstFeatureId')
        .addSelect('operation', 'operation')
        .addSelect('features_determined', 'featuresDetermined')
        .addSelect('split_by_property', 'splitByProperty')
        .addSelect('select_sub_sets', 'selectSubSets')
        .addSelect('features')
        .from('specification_feature_configs', 'configs')
        .where('specification_id IN (:...specificationIds)', {
          specificationIds,
        })
        .execute();

      const scenarioFeatureConfigsBySpecificationId = await this.getScenarioFeatureConfigsBySpecificationId(
        scenarioFeatureConfigs,
        scenarioFeaturesDataById,
      );

      const featuresByIdFromRaw = await this.getFeaturesByIdFromRaw(
        specifications.map((specification) => specification.raw),
      );

      fileContent = specifications.map(({ draft, id, raw }) => {
        const parsedRaw = this.parseRawContent(raw, featuresByIdFromRaw);
        return {
          draft,
          raw: parsedRaw,
          configs: scenarioFeatureConfigsBySpecificationId[id],
        };
      });
    }
    const outputFile = await this.fileRepository.save(
      Readable.from(JSON.stringify(fileContent)),
      `json`,
    );

    if (isLeft(outputFile)) {
      const errorMessage = `${ScenarioFeaturesSpecificationPieceExporter.name} - Scenario - couldn't save file - ${outputFile.left.description}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }
    return {
      ...input,
      uris: ClonePieceUrisResolver.resolveFor(
        ClonePiece.FeaturesSpecification,
        outputFile.right,
        {
          kind: input.resourceKind,
          scenarioId: input.resourceId,
        },
      ),
    };
  }
}
