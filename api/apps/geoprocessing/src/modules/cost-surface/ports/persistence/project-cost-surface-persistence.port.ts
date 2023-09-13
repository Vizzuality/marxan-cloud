import { CostSurfacePuDataEntity } from '@marxan/cost-surfaces';

export abstract class ProjectCostSurfacePersistencePort {
  abstract save(costs: CostSurfacePuDataEntity[]): Promise<void>;

  abstract generateInitialCostSurface(
    scenarioId: string,
    costSurfaceId?: string,
  ): Promise<void>;

  abstract updateCostSurfaceRange(costSurfaceId: string): Promise<void>;
}
