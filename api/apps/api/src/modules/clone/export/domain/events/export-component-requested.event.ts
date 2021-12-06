import { IEvent } from '@nestjs/cqrs';

import { ClonePiece } from '@marxan/cloning/domain';
import { ExportId } from '../export/export.id';
import { ComponentId } from '../export/export-component/component.id';
import { ResourceId } from '../export/resource.id';

export class ExportComponentRequested implements IEvent {
  constructor(
    public readonly exportId: ExportId,
    public readonly componentId: ComponentId,
    public readonly resourceId: ResourceId,
    public readonly piece: ClonePiece,
  ) {}
}
