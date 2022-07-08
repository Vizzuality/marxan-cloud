import { IEvent } from '@nestjs/cqrs';

export class ProjectDeleted implements IEvent {
  constructor(
    public readonly projectId: string,
    public readonly scenarioIds: string[],
    public readonly projectCustomFeaturesIds: string[],
  ) {}
}
