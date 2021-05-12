import { AdjustCostSurface } from '../../entry-points/adjust-cost-surface';
import { CostSurfaceInputDto } from '../../entry-points/adjust-cost-surface-input';
declare type Success = true;
export declare class UpdateCostSurfaceService implements AdjustCostSurface {
    update(scenarioId: string, constraints: CostSurfaceInputDto): Promise<Success>;
}
export {};
