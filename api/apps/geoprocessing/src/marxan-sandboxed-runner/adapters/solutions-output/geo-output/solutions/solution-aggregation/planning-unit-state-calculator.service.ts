import { Injectable } from '@nestjs/common';
import TypedEventEmitter from 'typed-emitter';

import { SolutionsEvents } from '../solutions-events';
import { PlanningUnitsState } from '../planning-unit-state';

@Injectable()
export class PlanningUnitStateCalculatorService {
  async consume(
    solutionsStream: TypedEventEmitter<SolutionsEvents>,
  ): Promise<PlanningUnitsState> {
    const result: PlanningUnitsState = {};
    return new Promise((resolve, reject) => {
      solutionsStream.on('error', reject);
      solutionsStream.on('finish', () => resolve(result));
      solutionsStream.on('data', (planningUnits) => {
        for (const pu of planningUnits) {
          result[pu.spdId] ??= {
            values: [],
            usedCount: 0,
          };
          result[pu.spdId].values[pu.runId - 1] = pu.value === 1;
          result[pu.spdId].usedCount += pu.value;
        }
      });
    });
  }
}
