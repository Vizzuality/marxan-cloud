import { ResourceId } from '@marxan/cloning/domain';
import { Command } from '@nestjs-architects/typed-cqrs';
import { Either } from 'fp-ts/lib/Either';
import { LegacyProjectImportRepositoryFindErrors } from '../domain/legacy-project-import/legacy-project-import.repository';

export const updateSolutionsAreLockFailed = Symbol(
  'update solutions are lock failed',
);

export type UpdateSolutionsAreLockedError =
  | LegacyProjectImportRepositoryFindErrors
  | typeof updateSolutionsAreLockFailed;

export type UpdateSolutionsAreLockedResponse = Either<
  UpdateSolutionsAreLockedError,
  true
>;

export class UpdateSolutionsAreLocked extends Command<UpdateSolutionsAreLockedResponse> {
  constructor(
    public readonly projectId: ResourceId,
    public readonly solutionsAreLocked: boolean,
  ) {
    super();
  }
}
