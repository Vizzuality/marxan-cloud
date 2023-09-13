import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { DbConnections } from '@marxan-api/ormconfig.connections';
import { CostSurface } from '@marxan-api/modules/cost-surface/cost-surface.api.entity';

export interface CostRange {
  min: number;
  max: number;
}

@Injectable()
export class CostRangeService {
  constructor(
    @InjectEntityManager(DbConnections.geoprocessingDB)
    private readonly geoEntityManager: EntityManager,
    @InjectEntityManager(DbConnections.default)
    private readonly apiEntityManager: EntityManager,
  ) {}

  async getCostSurfaceRange(costSurfaceId: string): Promise<CostRange> {
    const costRange = await this.apiEntityManager
      .getRepository(CostSurface)
      .findOne({
        select: ['min', 'max'],
        where: { id: costSurfaceId },
      });
    return { min: costRange?.min ?? 1, max: costRange?.max ?? 1 };
  }

  async getRangeForScenario(scenarioId: string): Promise<CostRange> {
    const { min, max } = (
      await this.geoEntityManager.query(
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

  async updateCostSurfaceRange(costSurfaceId: string): Promise<void> {
    const { min, max } = await this.getCostRangeForUpdate(costSurfaceId);
    await this.apiEntityManager
      .createQueryBuilder()
      .update('cost_surfaces')
      .set({ min, max })
      .where('id = :costSurfaceId', { costSurfaceId })
      .execute();
  }

  private async getCostRangeForUpdate(
    costSurfaceId: string,
  ): Promise<CostRange> {
    const { min, max } = (
      await this.geoEntityManager.query(
        `
        SELECT MIN(cspd.cost) as min, MAX(cspd.cost) as max
        FROM cost_surface_pu_data cspd
        WHERE cost_surface_id = $1;
      `,
        [costSurfaceId],
      )
    )[0];
    return { min: min ?? 1, max: max ?? 1 };
  }
}
