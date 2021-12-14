import { IEvent } from '@nestjs/cqrs';

export class SelectionChangedEvent implements IEvent {
  constructor(
    public readonly scenarioId: string,
    public readonly threshold: number,
    public readonly protectedAreasIds: string[],
  ) {}
}
