import { Injectable } from '@nestjs/common';
import { Either, isLeft, left, right } from 'fp-ts/lib/Either';
import { Readable } from 'stream';
import { parseStream, CsvParserStream } from 'fast-csv';

type PuDatRow = {
  id: number;
  cost?: number;
  status?: 0 | 1 | 2;
  xloc?: number;
  yloc?: number;
};

@Injectable()
export class PuDatReader {
  private validateData(data: PuDatRow): Either<string, true> {
    return right(true);
  }

  async readPuDatFile(file: Readable): Promise<Either<string, PuDatRow[]>> {
    const result: PuDatRow[] = [];
    const errors: string[] = [];
    let parser: CsvParserStream<PuDatRow, PuDatRow>;

    await new Promise<void>((resolve) => {
      parser = parseStream<PuDatRow, PuDatRow>(file, {
        headers: true,
        delimiter: ' ',
        ignoreEmpty: true,
      })
        .validate((data: PuDatRow, cb): void => {
          const isValidOrError = this.validateData(data);
          if (isLeft(isValidOrError)) {
            return cb(null, false, isValidOrError.left);
          }
          return cb(null, true);
        })
        .on('error', (error) => {
          console.error(error);
        })
        .on('data', (row: PuDatRow) => {
          console.log(row);
          result.push(row);
        })
        .on('data-invalid', (row, rowNumber, reason) => {
          console.log(
            `Invalid [rowNumber=${rowNumber}] [row=${JSON.stringify(row)}]`,
          );
          errors.push(reason);
        })
        .on('end', (rowCount: number) => {
          console.log(`Parsed ${rowCount} rows`);
          resolve();
        });
    });

    if (errors.length) {
      return left(JSON.stringify(errors));
    }
    return right(result);
  }
}
