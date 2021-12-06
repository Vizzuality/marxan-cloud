import { Either } from 'fp-ts/Either';
import { ImportSnapshot } from '../domain';

const unknownError = Symbol(`unknown error`);

export type Failure = typeof unknownError;
export type Success = true;

export abstract class ImportRepository {
  abstract save(
    importRequest: ImportSnapshot,
  ): Promise<Either<Failure, Success>>;

  abstract find(importId: string): Promise<ImportSnapshot | undefined>;
}
