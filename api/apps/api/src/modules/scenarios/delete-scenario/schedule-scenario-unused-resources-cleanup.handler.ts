import { UnusedResourcesCleanupJobInput } from '@marxan/unused-resources-cleanup';
import { unusedResourcesCleanupQueueToken } from '@marxan/unused-resources-cleanup/unused-resources-cleanup-queue.provider';
import { Inject, ConsoleLogger } from '@nestjs/common';
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs';
import { Queue } from 'bullmq';
import { ScheduleCleanupForScenarioUnusedResources } from './schedule-scenario-unused-resources-cleanup.command';

@CommandHandler(ScheduleCleanupForScenarioUnusedResources)
export class ScheduleCleanupForScenarioUnusedResourcesHandler
  implements
    IInferredCommandHandler<ScheduleCleanupForScenarioUnusedResources> {
  constructor(
    @Inject(unusedResourcesCleanupQueueToken)
    private readonly queue: Queue<UnusedResourcesCleanupJobInput>,
    private logger: ConsoleLogger,
  ) {
    this.logger.setContext(
      ScheduleCleanupForScenarioUnusedResourcesHandler.name,
    );
  }

  async execute({
    scenarioId,
  }: ScheduleCleanupForScenarioUnusedResources): Promise<void> {
    const job = await this.queue.add(`scenario-unused-resources-cleanup`, {
      scenarioId,
    });

    if (!job) {
      this.logger.error(
        `scenario-unused-resources-cleanup job couldn't be added to queue`,
      );
      return;
    }
  }
}
