import { Injectable } from '@nestjs/common';
import { isDefined, validateSync } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { ParsedRow } from '@marxan/marxan-output/execution-result';

@Injectable()
export class MarxanOutputParserService {
  #parseRow = (csvRow: string): ParsedRow => {
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

    return plainToClass(ParsedRow, {
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
    });
  };

  parse(csvContent: string): ParsedRow[] {
    return csvContent
      .split('\n')
      .slice(1)
      .map((row, index) => {
        if (row === '') {
          return;
        }

        const parsedRow = this.#parseRow(row);

        if (validateSync(parsedRow).length > 0) {
          throw new Error(
            `Unexpected values in Marxan output at value [${index}]: [${row}]`,
          );
        }
        return parsedRow;
      })
      .filter(isDefined) as ParsedRow[];
  }
}
