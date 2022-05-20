import { SaveFileError } from '@marxan/cloning-files-repository';
import { ResourceId } from '@marxan/cloning/domain';
import { UserId } from '@marxan/domain-ids';
import { LegacyProjectImportFileType } from '@marxan/legacy-project-import';
import { Command } from '@nestjs-architects/typed-cqrs';
import { Either } from 'fp-ts/lib/Either';
import { forbiddenError } from '../../access-control';
import { AddFileToLegacyProjectImportErrors } from '../domain/legacy-project-import/legacy-project-import';
import {
  LegacyProjectImportRepositoryFindErrors,
  LegacyProjectImportRepositorySaveErrors,
} from '../domain/legacy-project-import/legacy-project-import.repository';

export type AddFileToLegacyProjectImportHandlerErrors =
  | LegacyProjectImportRepositoryFindErrors
  | LegacyProjectImportRepositorySaveErrors
  | AddFileToLegacyProjectImportErrors
  | SaveFileError
  | typeof forbiddenError;

export class AddFileToLegacyProjectImport extends Command<
  Either<AddFileToLegacyProjectImportHandlerErrors, true>
> {
  constructor(
    public readonly projectId: ResourceId,
    public readonly file: Buffer,
    public readonly type: LegacyProjectImportFileType,
    public readonly userId: UserId,
  ) {
    super();
  }
}
