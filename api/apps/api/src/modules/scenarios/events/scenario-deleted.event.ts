import { IEvent } from '@nestjs/cqrs';

export class ScenarioDeleted implements IEvent {
  constructor(public readonly scenarioId: string) {}
}
