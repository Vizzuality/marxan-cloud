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
import { RemoteFeaturesData } from './entities/remote-features-data.geo.entity';
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
    @InjectRepository(RemoteFeaturesData, DbConnections.geoprocessingDB)
    private readonly remoteFeature: Repository<RemoteFeaturesData>,
    @InjectRepository(ScenarioFeaturesData, DbConnections.geoprocessingDB)
    private readonly remoteScenarioFeatures: Repository<ScenarioFeaturesData>,
  ) {
    super(remoteScenarioFeatures, 'scenario_features', 'scenario_feature', {
      logging: { muteAll: AppConfig.get<boolean>('logging.muteAll', false) },
    });
  }

  setFilters(
    query: SelectQueryBuilder<ScenarioFeaturesData>,
    filters?: FiltersSpecification['filter'],
    info?: UserSearchCriteria,
  ): SelectQueryBuilder<ScenarioFeaturesData> {
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
    const featuresDataIds = scenarioFeaturesData.map(
      (rsfd) => rsfd.featuresDataId,
    );

    if (featuresDataIds.length === 0) {
      return entitiesAndCount;
    }
    /**
     * (geo)scenario_feature_data.featureClassId -> (api)feature.id
     */
    const featureRelations: Record<string, string> = {};
    const featureData = await this.remoteFeature.find({
      where: {
        id: In(featuresDataIds),
      },
    });

    featureData.forEach((fd) => {
      featureRelations[fd.id] = fd.featureId;
    });

    const featureIds = featureData.map((fd) => fd.featureId);
    const features = await this.features.find({
      where: {
        id: In(featureIds),
      },
    });

    return [
      scenarioFeaturesData
        .map((sfd) => {
          const relatedFeature = features.find(
            (f) => f.id === featureRelations[sfd.featuresDataId],
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

  get serializerConfig(): JSONAPISerializerConfig<ScenarioFeaturesData> {
    return {
      attributes: [
        'description',
        'name',
        'tag',
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
      tag: assign.tag,
      name: assign.alias ?? undefined, // `null`
      description: assign.description ?? undefined,
    };
  };
}
