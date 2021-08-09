import { IEvent } from '@nestjs/cqrs';

export class SpecificationCandidateCreated implements IEvent {
  constructor(
    public readonly scenarioId: string,
    public readonly specificationId: string,
  ) {}
}
