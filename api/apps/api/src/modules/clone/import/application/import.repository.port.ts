import { Either } from 'fp-ts/Either';
import { Import, ImportId } from '../domain';

const unknownError = Symbol(`unknown error`);

export type Failure = typeof unknownError;
export type Success = true;

export abstract class ImportRepository {
  abstract save(importRequest: Import): Promise<Either<Failure, Success>>;

  abstract find(importId: ImportId): Promise<Import | undefined>;
}
