import { IEvent } from '@nestjs/cqrs';

export class SpecificationGotReady implements IEvent {
  constructor(public readonly id: string, public readonly scenarioId: string) {}
}
