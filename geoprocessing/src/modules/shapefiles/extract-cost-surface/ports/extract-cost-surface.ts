import { CostSurfaceInput } from './cost-surface-input';
import { PlanningUnitCost } from './planning-unit-cost';

export abstract class ExtractCostSurface {
  abstract extract(input: CostSurfaceInput): Promise<PlanningUnitCost[]>;
}
