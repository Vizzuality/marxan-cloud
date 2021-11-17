import { Injectable } from '@nestjs/common';
import TypedEventEmitter from 'typed-emitter';
import { uniq } from 'lodash';

import { SolutionsEvents } from '../solutions-events';
import {
  PlanningUnitSelectionState,
  PlanningUnitsSelectionState,
} from '../planning-unit-selection-state';

@Injectable()
export class PlanningUnitSelectionCalculatorService {
  async consume(
    solutionsStream: TypedEventEmitter<SolutionsEvents>,
  ): Promise<PlanningUnitsSelectionState> {
    const result: PlanningUnitsSelectionState = {
      puSelectionState: {},
      puUsageByRun: [],
    };

    return new Promise((resolve, reject) => {
      solutionsStream.on('error', reject);
      solutionsStream.on('finish', () => resolve(result));
      solutionsStream.on('data', (planningUnits) => {
        for (const pu of planningUnits) {
          result.puSelectionState[pu.spdId] ??= {
            values: [],
            usedCount: 0,
          } as PlanningUnitSelectionState;

          result.puSelectionState[pu.spdId].values[pu.runId - 1] =
            pu.value === 1;
          result.puSelectionState[pu.spdId].usedCount += pu.value;
        }

        const runIds = uniq(planningUnits.map((el) => el.runId));
        for (const runId of runIds) {
          result.puUsageByRun[runId - 1] = planningUnits.map((el) =>
            !!el.value ? 1 : 0,
          );
        }
      });
    });
  }
}
