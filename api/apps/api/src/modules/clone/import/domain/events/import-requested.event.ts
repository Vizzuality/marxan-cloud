import { IEvent } from '@nestjs/cqrs';
import { ResourceKind } from '@marxan/cloning/domain';

export class ImportRequested implements IEvent {
  constructor(
    public readonly id: string,
    public readonly resourceId: string,
    public readonly resourceKind: ResourceKind,
  ) {}
}
