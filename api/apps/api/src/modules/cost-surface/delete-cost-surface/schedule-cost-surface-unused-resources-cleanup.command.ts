import { Command } from '@nestjs-architects/typed-cqrs';

export class ScheduleCleanupForCostSurfaceUnusedResources extends Command<void> {
  constructor(public readonly costSurfaceId: string) {
    super();
  }
}
