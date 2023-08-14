import { Injectable } from '@nestjs/common';
import { CostSurfacePersistencePort } from '../../ports/persistence/cost-surface-persistence.port';
import { PlanningUnitCost } from '../../ports/planning-unit-cost';

@Injectable()
export class CostSurfaceRepoFake implements CostSurfacePersistencePort {
  saveMock = jest.fn();
  generateInitialCostSurfaceMock = jest.fn();

  async save(costs: PlanningUnitCost[]): Promise<void> {
    return this.saveMock(costs);
  }

  generateInitialCostSurface(scenarioId: string): Promise<void> {
    return this.generateInitialCostSurfaceMock(scenarioId);
  }
}
