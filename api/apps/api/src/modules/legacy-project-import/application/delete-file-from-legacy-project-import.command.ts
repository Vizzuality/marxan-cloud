import { ResourceId } from '@marxan/cloning/domain';
import { UserId } from '@marxan/domain-ids';
import { LegacyProjectImportFileId } from '@marxan/legacy-project-import/domain/legacy-project-import-file.id';
import { Command } from '@nestjs-architects/typed-cqrs';
import { Either } from 'fp-ts/lib/Either';
import { forbiddenError } from '../../access-control';
import {
  LegacyProjectImportRepositoryFindErrors,
  LegacyProjectImportRepositorySaveErrors,
} from '../domain/legacy-project-import/legacy-project-import.repository';

export type DeleteFileFromLegacyProjectImportHandlerErrors =
  | typeof forbiddenError
  | LegacyProjectImportRepositoryFindErrors
  | LegacyProjectImportRepositorySaveErrors;

export class DeleteFileFromLegacyProjectImport extends Command<
  Either<DeleteFileFromLegacyProjectImportHandlerErrors, true>
> {
  constructor(
    public readonly projectId: ResourceId,
    public readonly fileId: LegacyProjectImportFileId,
    public readonly userId: UserId,
  ) {
    super();
  }
}
