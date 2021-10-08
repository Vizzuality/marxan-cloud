import { IEvent } from '@nestjs/cqrs';

export class DataMovedFormPreparationEvent implements IEvent {
  constructor(
    public readonly scenarioId: string,
    public readonly specificationId: string,
  ) {}
}
