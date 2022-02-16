import { ArchiveLocation } from '@marxan/cloning/domain';
import { Command } from '@nestjs-architects/typed-cqrs';
import { Either } from 'fp-ts/lib/Either';
import { SaveError } from './import.repository.port';
import { Failure as ArchiveReadError } from './archive-reader.port';

export type ImportError = SaveError | ArchiveReadError;

export class ImportArchive extends Command<Either<ImportError, string>> {
  constructor(public readonly archiveLocation: ArchiveLocation) {
    super();
  }
}
