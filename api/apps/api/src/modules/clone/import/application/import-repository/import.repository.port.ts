import { Either } from 'fp-ts/Either';
import { Import, ImportId } from '../../domain';

export const saveError = Symbol(`save error`);

export type SaveError = typeof saveError;
export type Success = true;

export abstract class ImportRepository {
  abstract save(importRequest: Import): Promise<Either<SaveError, Success>>;

  abstract find(importId: ImportId): Promise<Import | undefined>;

  abstract transaction<T>(
    code: (repo: ImportRepository) => Promise<T>,
  ): Promise<T>;
}
