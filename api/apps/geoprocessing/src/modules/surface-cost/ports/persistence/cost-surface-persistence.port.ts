import { PlanningUnitCost } from '../planning-unit-cost';

export abstract class CostSurfacePersistencePort {
  abstract save(scenarioId: string, costs: PlanningUnitCost[]): Promise<void>;
}
