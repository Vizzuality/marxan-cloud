import { Injectable } from '@nestjs/common';
import { CostSurfacePersistencePort } from '../../ports/persistence/cost-surface-persistence.port';
import { PlanningUnitCost } from '../../ports/planning-unit-cost';

@Injectable()
export class CostSurfaceRepoFake implements CostSurfacePersistencePort {
  saveMock = jest.fn();

  async save(scenarioId: string, costs: PlanningUnitCost[]): Promise<void> {
    return this.saveMock(scenarioId, costs);
  }
}
