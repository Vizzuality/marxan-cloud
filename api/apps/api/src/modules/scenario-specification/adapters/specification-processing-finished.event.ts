import { IEvent } from '@nestjs/cqrs';

export class SpecificationProcessingFinishedEvent implements IEvent {
  constructor(
    public readonly scenarioId: string,
    public readonly specificationId: string,
  ) {}
}
