import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { ExecutionResult, ResultRow } from '@marxan/marxan-output';
import { isDefined } from '@marxan/utils';
import { validateSync } from 'class-validator';

import { MostDifferentService } from './most-different.service';

@Injectable()
export class ResultParserService {
  constructor(private readonly mostDifferentSolutions: MostDifferentService) {}

  parse(csvContent: string): ExecutionResult {
    return this.mostDifferentSolutions.map(
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
            mostDifferent: false,
          });
          if (validateSync(entry).length > 0) {
            throw new Error(
              `Unexpected values in Marxan output at value [${index}]: [${row}]`,
            );
          }
          return entry;
        })
        .filter(isDefined),
    );
  }
}
