import { CostSurfaceInputDto } from './adjust-cost-surface-input';
declare type Success = true;
export declare abstract class AdjustCostSurface {
    abstract update(scenarioId: string, constraints: CostSurfaceInputDto): Promise<Success>;
}
export {};
