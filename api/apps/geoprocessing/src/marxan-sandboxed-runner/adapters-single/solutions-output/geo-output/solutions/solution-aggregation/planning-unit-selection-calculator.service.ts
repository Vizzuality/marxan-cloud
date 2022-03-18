import { Injectable } from '@nestjs/common';
import TypedEventEmitter from 'typed-emitter';

import { SolutionsEvents } from '../solutions-events';
import {
  PlanningUnitSelectionState,
  PlanningUnitsSelectionState,
} from '../planning-unit-selection-state';
import { SolutionRowResult } from '../solution-row-result';

@Injectable()
export class PlanningUnitSelectionCalculatorService {
  async consume(
    solutionsStream: TypedEventEmitter<any>,
  ): Promise<PlanningUnitsSelectionState> {
    const result: PlanningUnitsSelectionState = {
      puSelectionState: {},
      puUsageByRun: [],
    };

    return new Promise((resolve, reject) => {
      solutionsStream.on('error', reject);
      solutionsStream.on('finish', () => resolve(result));
      solutionsStream.on('data', (planningUnits: SolutionRowResult[]) => {
        let index = 0;
        for (const pu of planningUnits) {
          result.puSelectionState[pu.spdId] ??= {
            values: [],
            usedCount: 0,
          } as PlanningUnitSelectionState;

          result.puSelectionState[pu.spdId].values[pu.runId - 1] =
            pu.value === 1;
          result.puSelectionState[pu.spdId].usedCount += pu.value;

          // Calculate PU usage by run
          result.puUsageByRun[pu.runId - 1] ??= [];
          result.puUsageByRun[pu.runId - 1][index] = pu.value ? 1 : 0;
          index++;
        }
      });
    });
  }
}
