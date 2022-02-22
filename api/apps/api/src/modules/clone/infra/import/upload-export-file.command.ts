import { ArchiveLocation } from '@marxan/cloning/domain';
import { unknownError } from '@marxan/files-repository';
import { Command } from '@nestjs-architects/typed-cqrs';
import { Either } from 'fp-ts/lib/Either';

export class UploadExportFile extends Command<
  Either<typeof unknownError, ArchiveLocation>
> {
  constructor(public readonly file: Express.Multer.File) {
    super();
  }
}
