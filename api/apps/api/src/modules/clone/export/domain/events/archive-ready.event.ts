import { IEvent } from '@nestjs/cqrs';

import { ArchiveLocation } from '@marxan/cloning/domain';
import { ExportId } from '../export/export.id';

export class ArchiveReady implements IEvent {
  constructor(
    public readonly exportId: ExportId,
    public readonly archiveLocation: ArchiveLocation,
  ) {}
}
