import { ArchiveLocation } from '@marxan/cloning/domain';
import { IEvent } from '@nestjs/cqrs';
import { ExportId } from '../export/export.id';

export class ArchiveReady implements IEvent {
  constructor(
    public readonly exportId: ExportId,
    public readonly archiveLocation: ArchiveLocation,
  ) {}
}
