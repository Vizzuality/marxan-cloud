import { IEvent } from '@nestjs/cqrs';

import { ExportId } from '../export/export.id';
import { ArchiveLocation } from '../../../shared-kernel/archive-location';

export class ArchiveReady implements IEvent {
  constructor(
    public readonly exportId: ExportId,
    public readonly archiveLocation: ArchiveLocation,
  ) {}
}
