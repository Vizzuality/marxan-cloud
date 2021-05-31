import { Injectable } from '@nestjs/common';
import { AdjustCostSurface } from '../../../analysis/entry-points/adjust-cost-surface';
import { CostSurfaceInputDto } from '../../../analysis/entry-points/adjust-cost-surface-input';

@Injectable()
export class AdjustCostServiceFake implements AdjustCostSurface {
  mock = jest.fn();

  async update(
    scenarioId: string,
    constraints: CostSurfaceInputDto,
  ): Promise<true> {
    return this.mock(scenarioId, constraints);
  }
}
