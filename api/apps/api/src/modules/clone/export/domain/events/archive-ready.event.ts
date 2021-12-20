import { IEvent } from '@nestjs/cqrs';

import {
  ArchiveLocation,
  ResourceId,
  ResourceKind,
} from '@marxan/cloning/domain';
import { ExportId } from '../export/export.id';

export class ArchiveReady implements IEvent {
  constructor(
    public readonly exportId: ExportId,
    public readonly resourceId: ResourceId,
    public readonly resourceKind: ResourceKind,
    public readonly archiveLocation: ArchiveLocation,
  ) {}
}
