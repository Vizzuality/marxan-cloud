import { UnusedResourcesCleanupJobInput } from '@marxan/unused-resources-cleanup';
import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs';
import { Queue } from 'bullmq';
import { ScheduleCleanupForProjectUnusedResources } from './schedule-project-unused-resources-cleanup.command';
import { unusedResourcesCleanupQueueToken } from '@marxan/unused-resources-cleanup/unused-resources-cleanup-queue.provider';

@CommandHandler(ScheduleCleanupForProjectUnusedResources)
export class ScheduleCleanupForProjectUnusedResourcesHandler
  implements IInferredCommandHandler<ScheduleCleanupForProjectUnusedResources>
{
  private readonly logger: Logger = new Logger(
    ScheduleCleanupForProjectUnusedResourcesHandler.name,
  );

  constructor(
    @Inject(unusedResourcesCleanupQueueToken)
    private readonly queue: Queue<UnusedResourcesCleanupJobInput>,
  ) {}

  async execute({
    projectId,
    projectCustomFeaturesIds,
    scenarioIds,
  }: ScheduleCleanupForProjectUnusedResources): Promise<void> {
    const job = await this.queue.add(`project-unused-resources-cleanup`, {
      type: 'Project',
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
