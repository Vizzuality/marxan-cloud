import { In, Repository, SelectQueryBuilder } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FiltersSpecification } from 'nestjs-base-service';
import {
  AppBaseService,
  JSONAPISerializerConfig,
} from '../../utils/app-base.service';

import { AppInfoDTO } from '../../dto/info.dto';

import { remoteConnectionName } from './entities/remote-connection-name';
import { GeoFeature } from '../geo-features/geo-feature.api.entity';
import {
  RemoteScenarioFeaturesData,
  remoteScenarioFeaturesDataViewName,
} from './entities/remote-scenario-features-data.geo.entity';
import { RemoteFeaturesData } from './entities/remote-features-data.geo.entity';

@Injectable()
export class ScenarioFeaturesService extends AppBaseService<
  RemoteScenarioFeaturesData,
  never,
  never,
  AppInfoDTO
> {
  constructor(
    @InjectRepository(GeoFeature)
    private readonly features: Repository<GeoFeature>,
    @InjectRepository(RemoteFeaturesData, remoteConnectionName)
    private readonly remoteFeature: Repository<RemoteFeaturesData>,
    @InjectRepository(RemoteScenarioFeaturesData, remoteConnectionName)
    private readonly remoteScenarioFeatures: Repository<RemoteScenarioFeaturesData>,
  ) {
    super(remoteScenarioFeatures, 'scenario_features', 'scenario_feature');
  }

  setFilters(
    query: SelectQueryBuilder<RemoteScenarioFeaturesData>,
    filters?: FiltersSpecification['filter'],
  ): SelectQueryBuilder<RemoteScenarioFeaturesData> {
    return query.andWhere(`${this.alias}.scenario_id = :scenarioId`, {
      scenarioId: filters?.scenarioId,
    });
  }

  async extendFindAllResults(
    entitiesAndCount: [any[], number],
  ): Promise<[any[], number]> {
    const scenarioFeaturesData = entitiesAndCount[0] as RemoteScenarioFeaturesData[];
    const featuresDataIds = scenarioFeaturesData.map(
      (rsfd) => rsfd.feature_class_id,
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
      featureRelations[fd.id] = fd.feature_id;
    });

    const featureIds = featureData.map((fd) => fd.feature_id);
    const features = await this.features.find({
      where: {
        id: In(featureIds),
      },
    });

    return [
      scenarioFeaturesData
        .map((sfd) => {
          const relatedFeature = features.find(
            (f) => f.id === featureRelations[sfd.feature_class_id],
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

  get serializerConfig(): JSONAPISerializerConfig<RemoteScenarioFeaturesData> {
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
    base: RemoteScenarioFeaturesData,
    assign: GeoFeature,
  ): RemoteScenarioFeaturesData => {
    const metArea = +(base?.current_pa ?? '0');
    const totalArea = +(base?.total_area ?? '0');
    const targetPct = (base?.target ?? 0) / 100;

    return {
      ...base,
      onTarget: metArea >= totalArea * targetPct,
      met: +((metArea / totalArea) * 100).toFixed(2),
      metArea,
      coverageTarget: +(base?.target ?? 0).toFixed(2),
      coverageTargetArea: (totalArea * (base?.target ?? 0)) / 100,
      totalArea,
      tag: assign.tag,
      name: assign.alias ?? undefined, // `null`
      description: assign.description ?? undefined,
    };
  };
}
