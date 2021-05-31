import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';

import {
  AppBaseService,
  JSONAPISerializerConfig,
} from '../../utils/app-base.service';
import { AppConfig } from '../../utils/config.utils';
import { remoteConnectionName } from './entities/remote-connection-name';
import { ScenariosPlanningUnitGeoEntity } from './entities/scenarios-planning-unit.geo.entity';
import { UserSearchCriteria } from './search-criteria';
import { FiltersSpecification } from 'nestjs-base-service';

@Injectable()
export class ScenariosPlanningUnitService extends AppBaseService<
  ScenariosPlanningUnitGeoEntity,
  never,
  never,
  UserSearchCriteria
> {
  constructor(
    @InjectRepository(ScenariosPlanningUnitGeoEntity, remoteConnectionName)
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
      attributes: ['id', 'lockStatus', 'puGeometryId', 'scenarioId'],
      keyForAttribute: 'camelCase',
    };
  }
}
