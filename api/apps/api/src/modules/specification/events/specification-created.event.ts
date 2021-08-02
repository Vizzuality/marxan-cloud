import { IEvent } from '@nestjs/cqrs';

export class SpecificationCreated implements IEvent {
  constructor(
    public readonly scenarioId: string,
    public readonly specificationId: string,
  ) {}
}
