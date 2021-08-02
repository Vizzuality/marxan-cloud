import { IEvent } from '@nestjs/cqrs';

export class SpecificationReadyToActivate implements IEvent {
  constructor(public readonly id: string) {}
}
