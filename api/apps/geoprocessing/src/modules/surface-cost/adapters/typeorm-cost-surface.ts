import { ScenariosPuCostDataGeo } from '@marxan/scenarios-planning-unit';
import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { chunk } from 'lodash';
import { EntityManager, In } from 'typeorm';
import { CostSurfacePersistencePort } from '../ports/persistence/cost-surface-persistence.port';
import { PlanningUnitCost } from '../ports/planning-unit-cost';

@Injectable()
export class TypeormCostSurface implements CostSurfacePersistencePort {
  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {}

  async save(values: PlanningUnitCost[]): Promise<void> {
    const chunkSize = 1000;
    await this.entityManager.transaction(async (em) => {
      await Promise.all(
        chunk(values, chunkSize).map(async (rows) => {
          const ids = rows.map((row) => row.id);
          await em.delete(ScenariosPuCostDataGeo, {
            scenariosPuDataId: In(ids),
          });
          await em.insert(
            ScenariosPuCostDataGeo,
            rows.map((row) => ({
              cost: row.cost,
              scenariosPuDataId: row.id,
            })),
          );
        }),
      );
    });
  }

  async generateInitialCostSurface(scenarioId: string): Promise<void> {
    await this.entityManager.query(
      `
        INSERT INTO scenarios_pu_cost_data (scenarios_pu_data_id, cost)
        SELECT spd.id, round(pug.area) / 1000000 as area
        FROM scenarios_pu_data spd
          INNER JOIN projects_pu ppu ON ppu.id = spd.project_pu_id
          INNER JOIN planning_units_geom pug ON pug.id = ppu.geom_id
        WHERE scenario_id = $1
      `,
      [scenarioId],
    );
  }
}
