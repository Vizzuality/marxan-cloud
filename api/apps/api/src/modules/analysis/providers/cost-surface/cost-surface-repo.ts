import { CostSurfaceInputDto } from '../../entry-points/adjust-cost-surface-input';

type Success = true;

export abstract class CostSurfaceRepo {
  abstract applyCostSurface(
    scenarioId: string,
    values: CostSurfaceInputDto['planningUnits'],
  ): Promise<Success>;
}
