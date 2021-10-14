import { IEvent } from '@nestjs/cqrs';

export class ProtectedAreaCreatedEvent implements IEvent {
  constructor(
    public readonly projectId: string,
    public readonly scenarioId: string,
    public readonly protectedAreaId: string[],
  ) {}
}
