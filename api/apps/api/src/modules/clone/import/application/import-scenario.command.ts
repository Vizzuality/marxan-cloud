import { ArchiveLocation } from '@marxan/cloning/domain';
import { Failure as ArchiveReadError } from '@marxan/cloning/infrastructure/archive-reader.port';
import { UserId } from '@marxan/domain-ids';
import { Command } from '@nestjs-architects/typed-cqrs';
import { Either } from 'fp-ts/lib/Either';
import { SaveError } from './import.repository.port';

export type ImportScenarioError = SaveError | ArchiveReadError;

export type ImportScenarioCommandResult = {
  importId: string;
  scenarioId: string;
};

export class ImportScenario extends Command<
  Either<ImportScenarioError, ImportScenarioCommandResult>
> {
  constructor(
    public readonly archiveLocation: ArchiveLocation,
    public readonly ownerId: UserId,
  ) {
    super();
  }
}
