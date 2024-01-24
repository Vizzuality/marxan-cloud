import { Either } from 'fp-ts/Either';

export const legacyProjectImportDoesntExist = Symbol(
  `doesn't exist legacy project import`,
);
export type LegacyProjectImportDoesntExist =
  typeof legacyProjectImportDoesntExist;

export abstract class LegacyProjectImportChecker {
  abstract isLegacyProjectImportCompletedFor(
    projectId: string,
  ): Promise<Either<LegacyProjectImportDoesntExist, boolean>>;
}
