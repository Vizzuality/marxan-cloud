import { Injectable } from '@nestjs/common';
import { isDefined, validateSync } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { OutputBestParsedRow } from '@marxan/marxan-output';

@Injectable()
export class MarxanOutputBestParserService {
  #parseRow = (csvRow: string): OutputBestParsedRow => {
    const [puid, solution] = csvRow.split(',');

    return plainToClass(OutputBestParsedRow, {
      puid: +puid,
      solution: +solution,
    });
  };

  parse(csvContent: string): OutputBestParsedRow[] {
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
      .filter(isDefined) as OutputBestParsedRow[];
  }
}
