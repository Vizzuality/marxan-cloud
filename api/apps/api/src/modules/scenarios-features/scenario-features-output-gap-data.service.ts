import { In, Repository, SelectQueryBuilder } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FiltersSpecification } from 'nestjs-base-service';
import {
  AppBaseService,
  JSONAPISerializerConfig,
} from '../../utils/app-base.service';

import { ScenarioFeaturesOutputGapData } from '@marxan/features';
import { UserSearchCriteria } from './search-criteria';
import { AppConfig } from '../../utils/config.utils';
import { DbConnections } from '@marxan-api/ormconfig.connections';
import { GeoFeature } from '../geo-features/geo-feature.api.entity';

@Injectable()
export class ScenarioFeaturesOutputGapDataService extends AppBaseService<
  ScenarioFeaturesOutputGapData,
  never,
  never,
  UserSearchCriteria
> {
  constructor(
    @InjectRepository(GeoFeature)
    private readonly features: Repository<GeoFeature>,
    @InjectRepository(ScenarioFeaturesOutputGapData, DbConnections.geoprocessingDB)
    private readonly gapData: Repository<ScenarioFeaturesOutputGapData>,
  ) {
    super(gapData, 'scenario_features', 'scenario_feature', {
      logging: { muteAll: AppConfig.get<boolean>('logging.muteAll', false) },
    });
  }

  setFilters(
    query: SelectQueryBuilder<ScenarioFeaturesOutputGapData>,
    filters?: FiltersSpecification['filter'],
    info?: UserSearchCriteria,
  ): SelectQueryBuilder<ScenarioFeaturesOutputGapData> {
    const scenarioId = info?.params?.scenarioId;
    if (scenarioId) {
      return query.andWhere(`${this.alias}.scenarioId = :scenarioId`, {
        scenarioId,
      });
    }
    return query;
  }

  async extendFindAllResults(
    entitiesAndCount: [any[], number],
  ): Promise<[any[], number]> {
    /*
     * Here we extend feature protection gap data (from geodb) with feature
     * metadata (name, etc.) from apidb.
     */
    const scenarioFeaturesData: ScenarioFeaturesOutputGapData[] = entitiesAndCount[0] as ScenarioFeaturesOutputGapData[];
    const featureIds: string[] = scenarioFeaturesData.map(
      (i) => i.featureId,
    );

    if (featureIds.length === 0) {
      return entitiesAndCount;
    }

    /**
     * (pseudo)FKs across dbs:
     * (geo)scenario_feature_data.featureClassId -> (geo)feature_data.id
     * (geo)feature_data.feature_id -> (api)feature.id
     */
    const featureRelations: Record<string, string> = {};
    const featureMetadata = await this.features.find({
      where: {
        id: In(featureIds),
      },
    });

    featureMetadata.forEach((fd) => {
      featureRelations[fd.id] = fd.id;
    });

    return [
      scenarioFeaturesData
        .map((sfd) => {
          const relatedFeature = featureMetadata.find(
            (f) => f.id === featureRelations[sfd.featureId],
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

  get serializerConfig(): JSONAPISerializerConfig<ScenarioFeaturesOutputGapData> {
    return {
      transform: (item: ScenarioFeaturesOutputGapData) => ({ ...item, id: item.featureId }),
      attributes: [
        'scenarioId',
        'featureId',
        'onTarget',
        'metArea',
        'met',
        'totalArea',
        'coverageTargetArea',
        'coverageTarget',
        'featureClassName',
        'name',
        'tag',
        'description',
      ],
      keyForAttribute: 'camelCase',
    };
  }

  #injectAndCompute = (
    base: ScenarioFeaturesOutputGapData,
    assign: GeoFeature,
  ): ScenarioFeaturesOutputGapData => {

    return {
      ...base,
      featureClassName: assign.featureClassName ?? undefined,
      tag: assign.tag,
      name: assign.alias ?? undefined, // `null`
      description: assign.description ?? undefined,
    };
  };
}
