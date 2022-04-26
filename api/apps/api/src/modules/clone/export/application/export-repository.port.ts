import { Either } from 'fp-ts/lib/Either';
import { Export, ExportId } from '../domain';

export const saveError = Symbol(`save error`);

export type SaveError = typeof saveError;
export type Success = true;

export abstract class ExportRepository {
  abstract save(exportInstance: Export): Promise<Either<SaveError, Success>>;

  abstract find(exportId: ExportId): Promise<Export | undefined>;

  abstract findLatestExportsFor(
    projectId: string,
    limit: number,
    options?: {
      isStandalone?: boolean;
      isFinished?: boolean;
      isLocal?: boolean;
    },
  ): Promise<Export[]>;

  abstract transaction<T>(
    code: (repo: ExportRepository) => Promise<T>,
  ): Promise<T>;
}
