import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { ExecutionResult, ResultRow } from '@marxan/marxan-output';
import { isDefined } from '@marxan/utils';
import { validateSync } from 'class-validator';

import { MostDifferentService } from './most-different.service';
import { BestSolutionService } from './best-solution.service';
import { PlanningUnitsSelectionState } from '@marxan-geoprocessing/marxan-sandboxed-runner/adapters/solutions-output/geo-output/solutions/planning-unit-selection-state';

@Injectable()
export class ResultParserService {
  constructor(
    private readonly mostDifferentSolutions: MostDifferentService,
    private readonly bestSolution: BestSolutionService,
  ) {}

  private static calculatePuValues(
    entry: ResultRow,
    planningUnitSelection: PlanningUnitsSelectionState,
  ) {
    entry.puValues = planningUnitSelection.puUsageByRun[entry.runId - 1];
    return entry;
  }

  private static parseRowToResultRow(csvRow: string): ResultRow {
    const [
      runId,
      score,
      cost,
      planningUnits,
      connectivity,
      connectivityTotal,
      connectivityIn,
      connectivityEdge,
      connectivityOut,
      connectivityInFraction,
      penalty,
      shortfall,
      missingValues,
      mpm,
    ] = csvRow.split(',');

    return plainToClass<ResultRow, ResultRow>(ResultRow, {
      runId: +runId,
      score: +score,
      cost: +cost,
      planningUnits: +planningUnits,
      connectivity: +connectivity,
      connectivityTotal: +connectivityTotal,
      connectivityIn: +connectivityIn,
      connectivityEdge: +connectivityEdge,
      connectivityOut: +connectivityOut,
      connectivityInFraction: +connectivityInFraction,
      penalty: +penalty,
      shortfall: +shortfall,
      missingValues: +missingValues,
      mpm: +mpm,
      best: false,
      distinctFive: false,
      puValues: [],
    });
  }

  async parse(
    csvContent: string,
    planningUnitSelection: PlanningUnitsSelectionState,
  ): Promise<ExecutionResult> {
    return this.bestSolution.map(
      this.mostDifferentSolutions.map(
        csvContent
          .split('\n')
          .slice(1)
          .map((row, index) => {
            if (row === '') {
              return;
            }

            const entry = ResultParserService.calculatePuValues(
              ResultParserService.parseRowToResultRow(row),
              planningUnitSelection,
            );

            if (validateSync(entry).length > 0) {
              throw new Error(
                `Unexpected values in Marxan output at value [${index}]: [${row}]`,
              );
            }
            return entry;
          })
          .filter(isDefined),
      ),
    );
  }
}
