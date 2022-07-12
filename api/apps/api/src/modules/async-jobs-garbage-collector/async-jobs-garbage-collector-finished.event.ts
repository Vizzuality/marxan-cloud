import { IEvent } from '@nestjs/cqrs';

export class AsyncJobsGarbageCollectorFinished implements IEvent {
  constructor(public readonly userId: string) {}
}
