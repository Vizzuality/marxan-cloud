import { PlanningUnitCost } from '../planning-unit-cost';

export abstract class CostSurfacePersistencePort {
  abstract save(costs: PlanningUnitCost[]): Promise<void>;

  abstract generateInitialCostSurface(scenarioId: string): Promise<void>;
}
