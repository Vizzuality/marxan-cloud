import { Either } from 'fp-ts/Either';

export const doesntExist = Symbol(`doesn't exist`);
export type DoesntExist = typeof doesntExist;

export abstract class ProjectChecker {
  abstract hasPendingExports(
    projectId: string,
  ): Promise<Either<DoesntExist, boolean>>;

  abstract isProjectReady(
    projectId: string,
  ): Promise<Either<DoesntExist, boolean>>;

  abstract isPublic(projectId: string): Promise<Either<DoesntExist, boolean>>;
}
