import { GetFileError } from '@marxan/cloning-files-repository';
import { Query } from '@nestjs-architects/typed-cqrs';
import { Either } from 'fp-ts/Either';
import { Readable } from 'stream';
import { ExportId } from '../domain';

export const exportNotFound = Symbol('export not found');
export const unfinishedExport = Symbol('unfinished export');

export type GetFailure =
  | typeof unfinishedExport
  | typeof exportNotFound
  | GetFileError;

export class GetExportArchive extends Query<Either<GetFailure, Readable>> {
  constructor(public readonly exportId: ExportId) {
    super();
  }
}
