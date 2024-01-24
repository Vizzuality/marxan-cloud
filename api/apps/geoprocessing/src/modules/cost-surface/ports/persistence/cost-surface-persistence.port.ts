import { PlanningUnitCost } from '../planning-unit-cost';
import { CostSurfacePuDataEntity } from '@marxan/cost-surfaces';

export abstract class CostSurfacePersistencePort {
  abstract save(
    costs: PlanningUnitCost[] | CostSurfacePuDataEntity[],
  ): Promise<void>;

  abstract generateInitialCostSurface(
    scenarioId: string,
    costSurfaceId?: string,
  ): Promise<void>;
}
