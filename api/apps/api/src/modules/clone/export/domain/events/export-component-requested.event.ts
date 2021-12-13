import { IEvent } from '@nestjs/cqrs';

import { ClonePiece, ComponentId, ResourceId } from '@marxan/cloning/domain';
import { ExportId } from '../export/export.id';

export class ExportComponentRequested implements IEvent {
  constructor(
    public readonly exportId: ExportId,
    public readonly componentId: ComponentId,
    public readonly resourceId: ResourceId,
    public readonly piece: ClonePiece,
  ) {}
}
