import { ResourceId } from '@marxan/cloning/domain';
import { Command } from '@nestjs-architects/typed-cqrs';
import { Either } from 'fp-ts/lib/Either';
import { GenerateLegacyProjectImportPiecesErrors } from '../domain/legacy-project-import/legacy-project-import';
import {
  LegacyProjectImportRepositoryFindErrors,
  LegacyProjectImportRepositorySaveErrors,
} from '../domain/legacy-project-import/legacy-project-import.repository';

export type RunLegacyProjectImportError =
  | GenerateLegacyProjectImportPiecesErrors
  | LegacyProjectImportRepositorySaveErrors
  | LegacyProjectImportRepositoryFindErrors;

export type RunLegacyProjectImportResponse = Either<
  RunLegacyProjectImportError,
  true
>;

export class RunLegacyProjectImport extends Command<RunLegacyProjectImportResponse> {
  constructor(public readonly projectId: ResourceId) {
    super();
  }
}
