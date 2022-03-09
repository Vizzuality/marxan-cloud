import { DbConnections } from '@marxan-api/ormconfig.connections';
import { ScenariosPlanningUnitGeoEntity } from '@marxan/scenarios-planning-unit';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Scenario } from '../scenario.api.entity';

@Injectable()
export class ScenarioPlanningUnitsLinkerService {
  constructor(
    @InjectRepository(
      ScenariosPlanningUnitGeoEntity,
      DbConnections.geoprocessingDB,
    )
    private readonly scenariosPuDataRepo: Repository<ScenariosPlanningUnitGeoEntity>,
  ) {}

  async link(scenario: Scenario): Promise<void> {
    await this.scenariosPuDataRepo.query(
      `
        INSERT INTO scenarios_pu_data (project_pu_id, scenario_id)
          SELECT id as ppu_id, '${scenario.id}' as scenario_id
          FROM projects_pu
          WHERE project_id = '${scenario.projectId}'
      `,
    );
  }
}
