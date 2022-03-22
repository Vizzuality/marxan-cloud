import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { FiltersSpecification } from 'nestjs-base-service';

import { DbConnections } from '@marxan-api/ormconfig.connections';

import { ScenariosPlanningUnitGeoEntity } from '@marxan/scenarios-planning-unit';
import {
  AppBaseService,
  JSONAPISerializerConfig,
} from '../../utils/app-base.service';
import { AppConfig } from '../../utils/config.utils';
import { UserSearchCriteria } from './search-criteria';

@Injectable()
export class ScenariosPlanningUnitService extends AppBaseService<
  ScenariosPlanningUnitGeoEntity,
  never,
  never,
  UserSearchCriteria
> {
  constructor(
    @InjectRepository(
      ScenariosPlanningUnitGeoEntity,
      DbConnections.geoprocessingDB,
    )
    private readonly puData: Repository<ScenariosPlanningUnitGeoEntity>,
  ) {
    super(puData, 'scenario_planning_unit', 'scenario_planning_units', {
      logging: { muteAll: AppConfig.get<boolean>('logging.muteAll', false) },
    });
  }

  setFilters(
    query: SelectQueryBuilder<ScenariosPlanningUnitGeoEntity>,
    filters?: FiltersSpecification['filter'],
    info?: UserSearchCriteria,
  ): SelectQueryBuilder<ScenariosPlanningUnitGeoEntity> {
    const scenarioId = info?.params?.scenarioId;
    if (scenarioId) {
      return query.andWhere(`${this.alias}.scenario_id = :scenarioId`, {
        scenarioId,
      });
    }
    return query;
  }

  get serializerConfig(): JSONAPISerializerConfig<ScenariosPlanningUnitGeoEntity> {
    return {
      attributes: ['id', 'lockStatus', 'projectPuId', 'scenarioId'],
      keyForAttribute: 'camelCase',
    };
  }
}
