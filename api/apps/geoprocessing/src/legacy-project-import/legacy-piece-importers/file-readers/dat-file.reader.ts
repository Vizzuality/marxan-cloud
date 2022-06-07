import { parseStream } from 'fast-csv';
import { Either, isLeft, left, right } from 'fp-ts/lib/Either';
import { Readable } from 'stream';

export type ValidationCheck = { result: boolean; errorMessage: string };

export const DefaultDatFileDelimiter = '\t';

export abstract class DatFileReader<I, O> {
  abstract validateData(data: O): Either<string, true>;

  abstract transform(data: I): O;

  async readFile(
    file: Readable,
    delimiter = DefaultDatFileDelimiter,
  ): Promise<Either<string, O[]>> {
    const result: O[] = [];
    const errors: string[] = [];

    await new Promise<void>((resolve) => {
      parseStream<I, O>(file, {
        headers: true,
        delimiter,
        ignoreEmpty: true,
      })
        .validate((data: O, cb): void => {
          const isValidOrError = this.validateData(data);
          if (isLeft(isValidOrError)) {
            return cb(null, false, isValidOrError.left);
          }
          return cb(null, true);
        })
        .transform((input: I) => this.transform(input))
        .on('error', (error) => {
          errors.push(error.message);
          resolve();
        })
        .on('data', (row: O) => {
          result.push(row);
        })
        .on('data-invalid', (row, rowNumber, reason) => {
          const error = `Invalid row [rowNumber=${rowNumber}] [reason=${reason}] [row=${JSON.stringify(
            row,
          )}]`;
          errors.push(error);
        })
        .on('end', (rowCount: number) => {
          resolve();
        });
    });

    if (errors.length) {
      return left(errors.join('. '));
    }
    return right(result);
  }
}
