import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DbConnections } from '@marxan-api/ormconfig.connections';
import { ScenariosPlanningUnitGeoEntity } from '@marxan/scenarios-planning-unit';

@Injectable()
export class ScenarioPlanningUnitsService {
  constructor(
    @InjectRepository(
      ScenariosPlanningUnitGeoEntity,
      DbConnections.geoprocessingDB,
    )
    private readonly puRepo: Repository<ScenariosPlanningUnitGeoEntity>,
  ) {}

  async get(scenarioId: string): Promise<ScenariosPlanningUnitGeoEntity[]> {
    return this.puRepo.find({
      where: {
        scenarioId,
      },
    });
  }
}
