import { IEvent } from '@nestjs/cqrs';

export class SpecificationActivated implements IEvent {
  constructor(public readonly id: string) {}
}
