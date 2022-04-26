import { unknownError } from '@marxan/cloning-files-repository';
import { UserId } from '@marxan/domain-ids';
import { Command } from '@nestjs-architects/typed-cqrs';
import { Either } from 'fp-ts/lib/Either';
import { ExportId } from '../../export';

export const invalidExportZipFile = Symbol('invalid export zip file');
export const cloningExportProvided = Symbol('cloning export provided');
export const errorStoringCloningFile = Symbol('error storing cloning file');
export const errorSavingExport = Symbol('error saving export');

export type GenerateExportFromZipFileError =
  | typeof unknownError
  | typeof invalidExportZipFile
  | typeof cloningExportProvided
  | typeof errorStoringCloningFile
  | typeof errorSavingExport;

export class GenerateExportFromZipFile extends Command<
  Either<GenerateExportFromZipFileError, ExportId>
> {
  constructor(
    public readonly file: Express.Multer.File,
    public readonly ownerId: UserId,
  ) {
    super();
  }
}
