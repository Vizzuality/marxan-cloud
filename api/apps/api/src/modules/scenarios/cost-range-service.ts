import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { DbConnections } from '@marxan-api/ormconfig.connections';

export interface CostRange {
  min: number;
  max: number;
}

@Injectable()
export class CostRangeService {
  constructor(
    @InjectEntityManager(DbConnections.geoprocessingDB)
    private readonly entityManager: EntityManager,
  ) {}

  async getRange(scenarioId: string): Promise<CostRange> {
    const { min, max } = (
      await this.entityManager.query(
        `
      SELECT MIN(spcd.cost) as min, MAX(spcd.cost) as max
      FROM scenarios_pu_data spd
      LEFT JOIN scenarios_pu_cost_data spcd on spd.id = spcd.scenarios_pu_data_id
      WHERE scenario_id = $1;
    `,
        [scenarioId],
      )
    )[0];
    return { min: min ?? 1, max: max ?? 1 };
  }
}
