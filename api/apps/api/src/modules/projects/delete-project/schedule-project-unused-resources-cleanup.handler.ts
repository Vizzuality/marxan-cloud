import { UnusedResourcesCleanupJobInput } from '@marxan/unused-resources-cleanup';
import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs';
import { Queue } from 'bullmq';
import { ScheduleCleanupForProjectUnusedResources } from './schedule-project-unused-resources-cleanup.command';
import { unusedResourcesCleanupQueueToken } from '../../../../../../libs/unused-resources-cleanup/src/unused-resources-cleanup-queue.provider';

@CommandHandler(ScheduleCleanupForProjectUnusedResources)
export class ScheduleCleanupForProjectUnusedResourcesHandler
  implements IInferredCommandHandler<ScheduleCleanupForProjectUnusedResources> {
  constructor(
    @Inject(unusedResourcesCleanupQueueToken)
    private readonly queue: Queue<UnusedResourcesCleanupJobInput>,
    private logger: Logger,
  ) {
    this.logger.setContext(
      ScheduleCleanupForProjectUnusedResourcesHandler.name,
    );
  }

  async execute({
    projectId,
    projectCustomFeaturesIds,
    scenarioIds,
  }: ScheduleCleanupForProjectUnusedResources): Promise<void> {
    const job = await this.queue.add(`project-unused-resources-cleanup`, {
      projectId,
      projectCustomFeaturesIds,
      scenarioIds,
    });

    if (!job) {
      this.logger.error(
        `project-unused-resources-cleanup job couldn't be added to queue`,
      );
      return;
    }
  }
}
