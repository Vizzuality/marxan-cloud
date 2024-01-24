import { ResourceId } from '@marxan/cloning/domain';
import { Either } from 'fp-ts/lib/Either';
import { LegacyProjectImport } from './legacy-project-import';

export const legacyProjectImportNotFound = Symbol(
  'legacy project import not found',
);

export const legacyProjectImportSaveError = Symbol(
  'legacy project import save error',
);

export type LegacyProjectImportRepositoryFindErrors =
  typeof legacyProjectImportNotFound;
export type LegacyProjectImportRepositorySaveErrors =
  typeof legacyProjectImportSaveError;

export abstract class LegacyProjectImportRepository {
  abstract find(
    projectId: ResourceId,
  ): Promise<
    Either<LegacyProjectImportRepositoryFindErrors, LegacyProjectImport>
  >;

  abstract save(
    legacyProjectImport: LegacyProjectImport,
  ): Promise<Either<LegacyProjectImportRepositorySaveErrors, true>>;

  abstract transaction<T>(
    code: (repo: LegacyProjectImportRepository) => Promise<T>,
  ): Promise<T>;
}
