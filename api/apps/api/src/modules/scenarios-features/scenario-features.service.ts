import { In, Repository, SelectQueryBuilder } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FiltersSpecification } from 'nestjs-base-service';
import {
  AppBaseService,
  JSONAPISerializerConfig,
} from '../../utils/app-base.service';

import { GeoFeature } from '../geo-features/geo-feature.api.entity';
import { ScenarioFeaturesData } from '@marxan/features';
import { UserSearchCriteria } from './search-criteria';
import { AppConfig } from '../../utils/config.utils';
import { DbConnections } from '@marxan-api/ormconfig.connections';

@Injectable()
export class ScenarioFeaturesService extends AppBaseService<
  ScenarioFeaturesData,
  never,
  never,
  UserSearchCriteria
> {
  constructor(
    @InjectRepository(GeoFeature)
    private readonly features: Repository<GeoFeature>,
    @InjectRepository(ScenarioFeaturesData, DbConnections.geoprocessingDB)
    private readonly remoteScenarioFeatures: Repository<ScenarioFeaturesData>,
  ) {
    super(remoteScenarioFeatures, 'scenario_features', 'scenario_feature', {
      logging: { muteAll: AppConfig.getBoolean('logging.muteAll', false) },
    });
  }

  async setFilters(
    query: SelectQueryBuilder<ScenarioFeaturesData>,
    filters?: FiltersSpecification['filter'],
    info?: UserSearchCriteria,
  ): Promise<SelectQueryBuilder<ScenarioFeaturesData>> {
    const scenarioId = info?.params?.scenarioId;
    if (scenarioId) {
      return query.andWhere(`${this.alias}.scenario_id = :scenarioId`, {
        scenarioId,
      });
    }
    return query;
  }

  async extendFindAllResults(
    entitiesAndCount: [any[], number],
  ): Promise<[any[], number]> {
    const scenarioFeaturesData = entitiesAndCount[0] as ScenarioFeaturesData[];

    if (scenarioFeaturesData.length === 0) {
      return entitiesAndCount;
    }

    const featureIds = scenarioFeaturesData.map((sfd) => sfd.apiFeatureId);
    const features = await this.features.find({
      where: {
        id: In(featureIds),
      },
    });

    return [
      scenarioFeaturesData
        .map((sfd) => {
          const relatedFeature = features.find(
            (f) => f.id === sfd.apiFeatureId,
          );

          if (!relatedFeature) {
            return undefined;
          }

          return this.#injectAndCompute(sfd, relatedFeature);
        })
        .filter((def) => def),
      scenarioFeaturesData.length,
    ];
  }

  async isFeaturePresentInAnyScenario(featureId: string): Promise<boolean> {
    const count = await this.remoteScenarioFeatures.query(
      `select count(*) from scenario_features_data where feature_class_id in (select id from features_data where feature_id = '${featureId}')`,
    );

    return count > 0;
  }

  get serializerConfig(): JSONAPISerializerConfig<ScenarioFeaturesData> {
    return {
      attributes: [
        'description',
        'name',
        'onTarget',
        'metArea',
        'met',
        'totalArea',
        'coverageTargetArea',
        'coverageTarget',
      ],
      keyForAttribute: 'camelCase',
    };
  }

  #injectAndCompute = (
    base: ScenarioFeaturesData,
    assign: GeoFeature,
  ): ScenarioFeaturesData => {
    const metArea = base?.currentArea ?? 0;
    const totalArea = base?.totalArea ?? 0;
    const targetPct = (base?.target ?? 0) / 100;

    return {
      ...base,
      onTarget: metArea >= totalArea * targetPct,
      met: +((metArea / totalArea) * 100).toFixed(2),
      metArea: +metArea.toFixed(2),
      coverageTarget: +(base?.target ?? 0).toFixed(2),
      coverageTargetArea: +((totalArea * (base?.target ?? 0)) / 100).toFixed(2),
      totalArea: +totalArea.toFixed(2),
      name: assign.alias ?? undefined, // `null`
      description: assign.description ?? undefined,
    };
  };
}
