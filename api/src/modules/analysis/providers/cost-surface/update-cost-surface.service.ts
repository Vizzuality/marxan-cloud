import { Injectable } from '@nestjs/common';
import { AdjustCostSurface } from '../../entry-points/adjust-cost-surface';
import { CostSurfaceInputDto } from '../../entry-points/adjust-cost-surface-input';

type Success = true;

@Injectable()
export class UpdateCostSurfaceService implements AdjustCostSurface {
  async update(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    scenarioId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    constraints: CostSurfaceInputDto,
  ): Promise<Success> {
    // TODO 1 validate if pu ids are allowed (probably use existing code from planning-units)
    // TODO 2 update geoDb
    return true;
  }
}
