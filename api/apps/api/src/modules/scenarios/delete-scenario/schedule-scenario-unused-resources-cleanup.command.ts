import { Command } from '@nestjs-architects/typed-cqrs';

export class ScheduleCleanupForScenarioUnusedResources extends Command<void> {
  constructor(public readonly scenarioId: string) {
    super();
  }
}
