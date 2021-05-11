import { CostSurfaceInputDto } from './adjust-cost-surface-input';

type Success = true;

export abstract class AdjustCostSurface {
  abstract update(
    scenarioId: string,
    constraints: CostSurfaceInputDto,
  ): Promise<Success>;
}
