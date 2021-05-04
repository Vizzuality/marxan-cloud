import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  AppBaseService,
  JSONAPISerializerConfig,
} from '../../utils/app-base.service';
import { remoteConnectionName } from './entities/remote-connection-name';
import { ScenariosPlanningUnitGeoEntity } from './entities/scenarios-planning-unit.geo.entity';

@Injectable()
export class ScenariosPlanningUnitService extends AppBaseService<
  ScenariosPlanningUnitGeoEntity,
  never,
  never,
  never // not yet needed
> {
  constructor(
    @InjectRepository(ScenariosPlanningUnitGeoEntity, remoteConnectionName)
    private readonly puData: Repository<ScenariosPlanningUnitGeoEntity>,
  ) {
    super(puData, 'scenario_planning_unit', 'scenario_planning_units');
  }

  get serializerConfig(): JSONAPISerializerConfig<ScenariosPlanningUnitGeoEntity> {
    return {
      attributes: ['id', 'lockStatus', 'puGeometryId', 'scenarioId'],
      keyForAttribute: 'camelCase',
    };
  }
}
