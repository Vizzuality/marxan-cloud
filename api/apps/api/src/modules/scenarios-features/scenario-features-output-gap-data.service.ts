import { Repository, SelectQueryBuilder } from 'typeorm';
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

@Injectable()
export class ScenarioFeaturesOutputGapDataService extends AppBaseService<
  ScenarioFeaturesOutputGapData,
  never,
  never,
  UserSearchCriteria
> {
  constructor(
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

  get serializerConfig(): JSONAPISerializerConfig<ScenarioFeaturesOutputGapData> {
    return {
      attributes: [
        'scenarioId',
        'featureId',
        'onTarget',
        'metArea',
        'met',
        'coverageTargetArea',
        'coverageTarget',
      ],
      keyForAttribute: 'camelCase',
    };
  }
}
