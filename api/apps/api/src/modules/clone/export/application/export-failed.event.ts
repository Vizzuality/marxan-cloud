import { ResourceId, ResourceKind } from '@marxan/cloning/domain';
import { ExportId } from '@marxan-api/modules/clone';
import { IEvent } from '@nestjs/cqrs';

export class ExportFailed implements IEvent {
  constructor(
    public readonly exportId: ExportId,
    public readonly resourceId: ResourceId,
    public readonly resourceKind: ResourceKind,
    public readonly location?: string,
  ) {}
}
