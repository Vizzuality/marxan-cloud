import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { DbConnections } from '@marxan-api/ormconfig.connections';

export class SummedSolutionDataService {
  constructor(
    @InjectEntityManager(DbConnections.geoprocessingDB)
    private readonly geoEntityManager: EntityManager,
  ) {}

  async getSummedSolutionsData(
    scenarioId: string,
  ): Promise<{ planning_unit: number; included_count: number }[]> {
    return this.geoEntityManager.query(
      `
    SELECT
      ppu.puid as planning_unit,
      included_count
    FROM
      output_scenarios_pu_data ospd
      JOIN
        scenarios_pu_data spd on ospd.scenario_pu_id = spd.id
      JOIN
        projects_pu ppu on ppu.id = spd.project_pu_id where spd.scenario_id = $1;`,
      [scenarioId],
    );
  }
}
