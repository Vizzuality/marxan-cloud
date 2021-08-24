import { In, Repository, SelectQueryBuilder } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FiltersSpecification } from 'nestjs-base-service';
import {
  AppBaseService,
  JSONAPISerializerConfig,
} from '../../utils/app-base.service';

import { ScenarioFeaturesGapData } from '@marxan/features';
import { UserSearchCriteria } from './search-criteria';
import { AppConfig } from '../../utils/config.utils';
import { DbConnections } from '@marxan-api/ormconfig.connections';

@Injectable()
export class ScenarioFeaturesGapDataService extends AppBaseService<
  ScenarioFeaturesGapData,
  never,
  never,
  UserSearchCriteria
> {
  constructor(
    @InjectRepository(ScenarioFeaturesGapData, DbConnections.geoprocessingDB)
    private readonly gapData: Repository<ScenarioFeaturesGapData>,
  ) {
    super(gapData, 'scenario_features', 'scenario_feature', {
      logging: { muteAll: AppConfig.get<boolean>('logging.muteAll', false) },
    });
  }

  setFilters(
    query: SelectQueryBuilder<ScenarioFeaturesGapData>,
    filters?: FiltersSpecification['filter'],
    info?: UserSearchCriteria,
  ): SelectQueryBuilder<ScenarioFeaturesGapData> {
    const scenarioId = info?.params?.scenarioId;
    if (scenarioId) {
      return query.andWhere(`${this.alias}.scenarioId = :scenarioId`, {
        scenarioId,
      });
    }
    return query;
  }

  get serializerConfig(): JSONAPISerializerConfig<ScenarioFeaturesGapData> {
    return {
      attributes: [
        'scenarioId',
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
}
