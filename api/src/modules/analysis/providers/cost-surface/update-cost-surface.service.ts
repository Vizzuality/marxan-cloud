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
    // TODO 1 validate geoJson formally
    // TODO 2 extract pu ids from geoJson
    // TODO 3 validate if pu ids are allowed (probably use existing code from planning-units)
    // TODO 4 update geoDb

    return true;
  }
}
