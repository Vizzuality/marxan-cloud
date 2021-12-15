import { Query } from '@nestjs-architects/typed-cqrs';
import { ArchiveLocation } from '@marxan/cloning/domain';

import { ExportId } from '../domain';

export { ExportId };

export class GetExportArchive extends Query<ArchiveLocation | null> {
  constructor(public readonly exportId: ExportId) {
    super();
  }
}
