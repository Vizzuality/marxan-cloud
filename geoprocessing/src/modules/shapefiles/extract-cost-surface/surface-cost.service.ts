import { Injectable } from '@nestjs/common';
import { CostSurfaceInput } from './ports/cost-surface-input';
import { ExtractCostSurface } from './ports/extract-cost-surface';
import { PlanningUnitCost } from './ports/planning-unit-cost';

@Injectable()
export class SurfaceCostService implements ExtractCostSurface {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  extract(input: CostSurfaceInput): Promise<PlanningUnitCost[]> {
    return Promise.resolve([]);
  }
}
