import { Command } from '@nestjs-architects/typed-cqrs';

export class ScheduleCleanupForProjectUnusedResources extends Command<void> {
  constructor(
    public readonly projectId: string,
    public readonly scenarioIds: string[],
    public readonly projectCustomFeaturesIds: string[],
  ) {
    super();
  }
}
