import { Injectable } from '@nestjs/common';
import { CostSurfaceRepo } from '../cost-surface-repo';
import { ScenariosPlanningUnitService } from '../../../../scenarios-planning-unit/scenarios-planning-unit.service';
import { CostSurfaceInputDto } from '../../../entry-points/adjust-cost-surface-input';

type Success = true;

@Injectable()
export class BaseAppCostSurface
  extends ScenariosPlanningUnitService
  implements CostSurfaceRepo {
  async applyCostSurface(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    scenarioId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    values: CostSurfaceInputDto['planningUnits'],
  ): Promise<Success> {
    return true;
  }
}
