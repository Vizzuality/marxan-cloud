import { SaveFileError } from '@marxan/cloning-files-repository';
import { ResourceId } from '@marxan/cloning/domain';
import { UserId } from '@marxan/domain-ids';
import { Command } from '@nestjs-architects/typed-cqrs';
import { Either } from 'fp-ts/lib/Either';
import { forbiddenError } from '../../access-control';
import { HaltLegacyProjectImportErros } from '../domain/legacy-project-import/legacy-project-import';
import {
  LegacyProjectImportRepositoryFindErrors,
  LegacyProjectImportRepositorySaveErrors,
} from '../domain/legacy-project-import/legacy-project-import.repository';

export type CancelLegacyProjectImportHandlerErrors =
  | LegacyProjectImportRepositoryFindErrors
  | LegacyProjectImportRepositorySaveErrors
  | HaltLegacyProjectImportErros
  | typeof forbiddenError;

export type CancelLegacyProjectImportResponse = Either<
  CancelLegacyProjectImportHandlerErrors,
  true
>;

export class CancelLegacyProjectImport extends Command<CancelLegacyProjectImportResponse> {
  constructor(
    public readonly projectId: ResourceId,
    public readonly userId: UserId,
  ) {
    super();
  }
}
