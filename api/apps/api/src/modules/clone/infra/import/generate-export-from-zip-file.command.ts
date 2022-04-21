import { unknownError } from '@marxan/cloning-files-repository';
import { Command } from '@nestjs-architects/typed-cqrs';
import { Either } from 'fp-ts/lib/Either';
import { ExportId } from '../../export';

export const invalidExportZipFile = Symbol('invalid export zip file');

export type GenerateExportFromZipFileError =
  | typeof unknownError
  | typeof invalidExportZipFile;

export class GenerateExportFromZipFile extends Command<
  Either<GenerateExportFromZipFileError, ExportId>
> {
  constructor(public readonly file: Express.Multer.File) {
    super();
  }
}
