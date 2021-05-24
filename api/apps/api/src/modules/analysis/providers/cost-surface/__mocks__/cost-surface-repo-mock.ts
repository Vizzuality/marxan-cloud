import { Injectable } from '@nestjs/common';
import { CostSurfaceRepo } from '../cost-surface-repo';
import { CostSurfaceInputDto } from '../../../entry-points/adjust-cost-surface-input';

@Injectable()
export class CostSurfaceRepoMock implements CostSurfaceRepo {
  mock = jest.fn();

  async applyCostSurface(
    scenarioId: string,
    values: CostSurfaceInputDto['planningUnits'],
  ): Promise<true> {
    return this.mock(scenarioId, values);
  }
}
