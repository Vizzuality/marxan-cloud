import { UnusedResourcesCleanupJobInput } from '@marxan/unused-resources-cleanup';
import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs';
import { Queue } from 'bullmq';
import { unusedResourcesCleanupQueueToken } from '@marxan/unused-resources-cleanup/unused-resources-cleanup-queue.provider';
import { ScheduleCleanupForCostSurfaceUnusedResources } from '@marxan-api/modules/cost-surface/delete-cost-surface/schedule-cost-surface-unused-resources-cleanup.command';

@CommandHandler(ScheduleCleanupForCostSurfaceUnusedResources)
export class ScheduleCleanupForCostSurfaceUnusedResourcesHandler
  implements
    IInferredCommandHandler<ScheduleCleanupForCostSurfaceUnusedResources> {
  private readonly logger: Logger = new Logger(
    ScheduleCleanupForCostSurfaceUnusedResourcesHandler.name,
  );

  constructor(
    @Inject(unusedResourcesCleanupQueueToken)
    private readonly queue: Queue<UnusedResourcesCleanupJobInput>,
  ) {}

  async execute({
    costSurfaceId,
  }: ScheduleCleanupForCostSurfaceUnusedResources): Promise<void> {
    const job = await this.queue.add(`cost-surface-unused-resources-cleanup`, {
      type: 'Cost Surface',
      costSurfaceId,
    });

    if (!job) {
      this.logger.error(
        `cost-surface-unused-resources-cleanup job couldn't be added to queue`,
      );
      return;
    }
  }
}
