import { forbiddenError } from '@marxan-api/modules/access-control';
import { ResourceId } from '@marxan/cloning/domain';
import { UserId } from '@marxan/domain-ids';
import { Command } from '@nestjs-architects/typed-cqrs';
import { Either } from 'fp-ts/lib/Either';
import { RunLegacyProjectImportErrors } from '../domain/legacy-project-import/legacy-project-import';
import {
  LegacyProjectImportRepositoryFindErrors,
  LegacyProjectImportRepositorySaveErrors,
} from '../domain/legacy-project-import/legacy-project-import.repository';

export type RunLegacyProjectImportError =
  | RunLegacyProjectImportErrors
  | LegacyProjectImportRepositorySaveErrors
  | LegacyProjectImportRepositoryFindErrors
  | typeof forbiddenError;

export type RunLegacyProjectImportResponse = Either<
  RunLegacyProjectImportError,
  true
>;

export class RunLegacyProjectImport extends Command<RunLegacyProjectImportResponse> {
  constructor(
    public readonly projectId: ResourceId,
    public readonly userId: UserId,
  ) {
    super();
  }
}
