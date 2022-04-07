import { ArchiveLocation } from '@marxan/cloning/domain';
import { Failure as ArchiveReadError } from '@marxan/cloning/infrastructure/archive-reader.port';
import { Command } from '@nestjs-architects/typed-cqrs';
import { Either } from 'fp-ts/lib/Either';
import { SaveError } from './import.repository.port';

export type ImportProjectError = SaveError | ArchiveReadError;

export type ImportProjectCommandResult = {
  importId: string;
  projectId: string;
};

export class ImportProject extends Command<
  Either<ImportProjectError, ImportProjectCommandResult>
> {
  constructor(public readonly archiveLocation: ArchiveLocation) {
    super();
  }
}
