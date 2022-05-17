import { UserId } from '@marxan/domain-ids';
import { unknownError } from '@marxan/utils/file-operations';
import { Command } from '@nestjs-architects/typed-cqrs';
import { Either } from 'fp-ts/lib/Either';
import { ExportId } from '../../export';
import {
  integrityCheckFailed,
  invalidSignature,
} from '../../export/application/manifest-file-service.port';

export const invalidExportZipFile = Symbol('invalid export zip file');
export const cloningExportProvided = Symbol('cloning export provided');
export const errorStoringCloningFile = Symbol('error storing cloning file');
export const errorSavingExport = Symbol('error saving export');

export type GenerateExportFromZipFileError =
  | typeof unknownError
  | typeof invalidExportZipFile
  | typeof cloningExportProvided
  | typeof errorStoringCloningFile
  | typeof errorSavingExport
  | typeof integrityCheckFailed
  | typeof invalidSignature;

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
