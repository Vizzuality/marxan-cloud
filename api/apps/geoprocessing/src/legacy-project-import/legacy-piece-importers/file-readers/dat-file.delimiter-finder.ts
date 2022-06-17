import { Either } from 'fp-ts/lib/Either';
import { Readable } from 'stream';

export const invalidDelimiter = Symbol('invalid delitimiter');
export type DatFileDelimiter = Either<typeof invalidDelimiter, string>;

export abstract class DatFileDelimiterFinder {
  abstract findDelimiter(file: Readable): Promise<DatFileDelimiter>;
}
