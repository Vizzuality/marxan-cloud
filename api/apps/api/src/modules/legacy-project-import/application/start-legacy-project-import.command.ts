import { ResourceId } from '@marxan/cloning/domain';
import { UserId } from '@marxan/domain-ids';
import { Command } from '@nestjs-architects/typed-cqrs';
import { Either } from 'fp-ts/lib/Either';
import { LegacyProjectImportRepositorySaveErrors } from '../domain/legacy-project-import/legacy-project-import.repository';

export const createShellsFailed = Symbol(
  'cant create project and scenario shells',
);

export type StartLegacyProjectImportError =
  | LegacyProjectImportRepositorySaveErrors
  | typeof createShellsFailed;

export interface StartLegacyProjectImportResult {
  projectId: ResourceId;
  scenarioId: ResourceId;
}

export type StartLegacyProjectImportResponse = Either<
  StartLegacyProjectImportError,
  StartLegacyProjectImportResult
>;

export class StartLegacyProjectImport extends Command<StartLegacyProjectImportResponse> {
  constructor(
    public readonly name: string,
    public readonly ownerId: UserId,
    public readonly solutionsAreLocked: boolean,
  ) {
    super();
  }
}
