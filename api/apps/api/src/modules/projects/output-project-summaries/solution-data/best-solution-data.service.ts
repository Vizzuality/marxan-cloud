import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { ScenariosOutputResultsApiEntity } from '@marxan/marxan-output';
import { DbConnections } from '@marxan-api/ormconfig.connections';

export class BestSolutionDataService {
  constructor(
    @InjectEntityManager(DbConnections.geoprocessingDB)
    private readonly geoEntityManager: EntityManager,
    @InjectRepository(ScenariosOutputResultsApiEntity)
    private readonly scenariosOutputResultsRepo: Repository<ScenariosOutputResultsApiEntity>,
  ) {}

  async getBestSolutionData(
    scenarioId: string,
  ): Promise<{ planning_unit: number; selected: 0 | 1 }[]> {
    const scenarioOutputResult = await this.scenariosOutputResultsRepo.findOneOrFail(
      {
        where: { scenarioId, best: true },
      },
    );
    const bestRunId = scenarioOutputResult.runId;

    return this.geoEntityManager.query(
      `
      SELECT
        ppu.puid as planning_unit,
        ospd.value[$1] as selected
      FROM
        output_scenarios_pu_data ospd
        JOIN
          scenarios_pu_data spd on ospd.scenario_pu_id = spd.id
        JOIN
          projects_pu ppu on ppu.id = spd.project_pu_id where spd.scenario_id = $2;`,
      [bestRunId, scenarioId],
    );
  }
}
