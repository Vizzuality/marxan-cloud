import { IEvent } from '@nestjs/cqrs';
import { ResourceId, ResourceKind } from '@marxan/cloning/domain';
import { ExportId } from '@marxan-api/modules/clone';

export class ExportRequested implements IEvent {
  constructor(
    public readonly exportId: ExportId,
    public readonly resourceId: ResourceId,
    public readonly resourceKind: ResourceKind,
  ) {}
}
