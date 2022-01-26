import { Query } from '@nestjs-architects/typed-cqrs';
import { ArchiveLocation } from '@marxan/cloning/domain';

import { ExportId } from '../domain';
import { Either } from 'fp-ts/Either';

export { ExportId };
export const locationNotFound = Symbol(`location not found`);
export type GetFailure = typeof locationNotFound;

export class GetExportArchive extends Query<
  Either<GetFailure, ArchiveLocation>
> {
  constructor(public readonly exportId: ExportId) {
    super();
  }
}
