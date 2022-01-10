import { Either } from 'fp-ts/Either';

export const doesntExist = Symbol(`doesn't exist`);
export const hasPendingExport = Symbol(`has pending export`);
export type DoesntExist = typeof doesntExist;
export type HasPendingExport = typeof hasPendingExport;

export abstract class ProjectChecker {
  abstract hasProjectPendingExports(
    projectId: string,
  ): Promise<Either<HasPendingExport, boolean>>;

  abstract isProjectReady(
    projectId: string,
  ): Promise<Either<DoesntExist, boolean>>;
}
