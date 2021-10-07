import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { ExecutionResult, ResultRow } from '@marxan/marxan-output';
import { isDefined } from '@marxan/utils';
import { validateSync } from 'class-validator';
import { chunk } from 'lodash';

import { MostDifferentService } from './most-different.service';
import { BestSolutionService } from './best-solution.service';

@Injectable()
export class ResultParserService {
  constructor(
    private readonly mostDifferentSolutions: MostDifferentService,
    private readonly bestSolution: BestSolutionService,
  ) {}

  async parse(csvContent: string): Promise<ExecutionResult> {
    const chunks = chunk(csvContent.split('\n').slice(1), 100);

    const results: ExecutionResult = [];
    for (const batch of chunks) {
      for (const row of batch) {
        if (row === '') {
          continue;
        }
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
        ] = row.split(',');
        const entry = await plainToClass<ResultRow, ResultRow>(ResultRow, {
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
        });
        if (validateSync(entry).length > 0) {
          throw new Error(
            `Unexpected values in Marxan output at value [${row}]`,
          );
        }
        results.push(entry);
      }
    }

    return this.bestSolution.map(
      this.mostDifferentSolutions.map(
        csvContent
          .split('\n')
          .slice(1)
          .map((row, index) => {
            if (row === '') {
              return;
            }
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
            ] = row.split(',');
            const entry = plainToClass<ResultRow, ResultRow>(ResultRow, {
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
              // distinctFive should always be set to `false` here: the five most
              // different solutions are tagged as such via
              // `MostDifferentService`.
              distinctFive: false,
            });
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
