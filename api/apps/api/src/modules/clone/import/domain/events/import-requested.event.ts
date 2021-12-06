import { IEvent } from '@nestjs/cqrs';
import { ResourceKind } from '@marxan-api/modules/clone/shared-kernel/resource.kind';

export class ImportRequested implements IEvent {
  constructor(
    public readonly id: string,
    public readonly resourceId: string,
    public readonly resourceKind: ResourceKind,
  ) {}
}
