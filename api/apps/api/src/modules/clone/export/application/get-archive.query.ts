import { GetFileError } from '@marxan/cloning-files-repository';
import { Query } from '@nestjs-architects/typed-cqrs';
import { Either } from 'fp-ts/Either';
import { Readable } from 'stream';
import { ExportId } from '../domain';

export { ExportId };
export const locationNotFound = Symbol(`location not found`);
export type GetFailure = typeof locationNotFound | GetFileError;

export class GetExportArchive extends Query<Either<GetFailure, Readable>> {
  constructor(public readonly exportId: ExportId) {
    super();
  }
}
