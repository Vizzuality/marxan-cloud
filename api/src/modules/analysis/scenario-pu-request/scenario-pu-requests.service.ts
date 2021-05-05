import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AppBaseService,
  JSONAPISerializerConfig,
} from '../../../utils/app-base.service';
import { DbConnections } from '../../../ormconfig.connections';
import { ScenarioPuRequestGeo } from './entity/scenario-pu-request.geo.entity';

@Injectable()
export class ScenarioPuRequestsService extends AppBaseService<
  ScenarioPuRequestGeo,
  ScenarioPuRequestGeo,
  never,
  never // not yet needed
> {
  constructor(
    @InjectRepository(ScenarioPuRequestGeo, DbConnections.geoprocessingDB)
    private readonly puData: Repository<ScenarioPuRequestGeo>,
  ) {
    super(
      puData,
      'scenario_planning_unit_request',
      'scenario_planning_unit_requests',
    );
  }

  get serializerConfig(): JSONAPISerializerConfig<ScenarioPuRequestGeo> {
    return {
      attributes: [
        'id',
        'scenarioId',
        'excludedFromGeoJson',
        'excludedFromShapefile',
        'excludedPlantingUnits',
        'includedFromGeoJson',
        'includedFromShapefile',
        'includedPlantingUnits',
      ],
      keyForAttribute: 'camelCase',
    };
  }
}
