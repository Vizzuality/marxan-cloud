import { IEvent } from '@nestjs/cqrs';

import { ExportId } from '../export/export.id';
import { ComponentId } from '../export/export-component/component.id';
import { ResourceId } from '../export/resource.id';
import { ClonePiece } from '../../../shared-kernel/clone-piece';

export class ExportComponentRequested implements IEvent {
  constructor(
    public readonly exportId: ExportId,
    public readonly componentId: ComponentId,
    public readonly resourceId: ResourceId,
    public readonly piece: ClonePiece,
  ) {}
}
