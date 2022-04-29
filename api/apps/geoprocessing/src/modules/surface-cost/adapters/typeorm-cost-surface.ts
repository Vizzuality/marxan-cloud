import {
  ScenariosPuCostDataGeo,
  ScenariosPuPaDataGeo,
} from '@marxan/scenarios-planning-unit';
import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { chunk } from 'lodash';
import { EntityManager, In, Repository } from 'typeorm';
import { CostSurfacePersistencePort } from '../ports/persistence/cost-surface-persistence.port';
import { PlanningUnitCost } from '../ports/planning-unit-cost';

@Injectable()
export class TypeormCostSurface implements CostSurfacePersistencePort {
  constructor(
    @InjectRepository(ScenariosPuCostDataGeo)
    private readonly costs: Repository<ScenariosPuCostDataGeo>,
    @InjectRepository(ScenariosPuPaDataGeo)
    private readonly scenarioDataRepo: Repository<ScenariosPuPaDataGeo>,
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {
    //
  }

  async save(scenarioId: string, values: PlanningUnitCost[]): Promise<void> {
    const scenarioData = await this.scenarioDataRepo.find({
      where: {
        scenarioId,
        id: In(values.map((pair) => pair.id)),
      },
    });
    const puDataIds = scenarioData.map((sd) => sd.id);
    await this.entityManager.transaction(async (manager) => {
      for (const [, ids] of chunk(puDataIds, 100).entries()) {
        await manager.delete(ScenariosPuCostDataGeo, {
          scenariosPuDataId: In(ids),
        });
      }

      for (const [, rows] of chunk(values, 100).entries()) {
        await manager.insert(
          ScenariosPuCostDataGeo,
          rows.map((row) => ({
            cost: row.cost,
            scenariosPuDataId: row.id,
          })),
        );
      }
    });
  }
}
