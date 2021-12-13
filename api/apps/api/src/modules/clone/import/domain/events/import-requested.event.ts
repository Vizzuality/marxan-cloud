import { IEvent } from '@nestjs/cqrs';
import { ResourceId, ResourceKind } from '@marxan/cloning/domain';

export class ImportRequested implements IEvent {
  constructor(
    public readonly id: string,
    public readonly resourceId: ResourceId,
    public readonly resourceKind: ResourceKind,
  ) {}
}
