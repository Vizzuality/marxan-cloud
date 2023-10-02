import { IEvent } from '@nestjs/cqrs';

export class CostSurfaceDeleted implements IEvent {
  constructor(public readonly costSurfaceId: string) {}
}
