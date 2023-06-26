import { Queue } from './queue';
import { Queue as UnderlyingBullQueue } from 'bullmq';
import { Inject, Provider } from '@nestjs/common';
import { QueueToken } from '@marxan-api/modules/queue/queue.tokens';

export const costSurfaceTemplateCreationQueue = Symbol(
  'project-template-creation-queue',
);
// wish to have it in provider
export const queueName = 'project-template-creation';
export const queueProvider: Provider<UnderlyingBullQueue<unknown, unknown>> = {
  provide: costSurfaceTemplateCreationQueue,
  useExisting: QueueToken,
};

export class BullmqQueue extends Queue {
  constructor(
    @Inject(costSurfaceTemplateCreationQueue)
    private readonly underlyingQueue: UnderlyingBullQueue<unknown, unknown>,
  ) {
    super();
  }

  async isPending(scenarioId: string): Promise<boolean> {
    const job = await this.underlyingQueue.getJob(scenarioId);

    return (
      ((await job?.isActive()) ||
        (await job?.isWaiting()) ||
        (await job?.isDelayed())) ??
      false
    );
  }

  async startProcessing(projectId: string): Promise<void> {
    const job = await this.underlyingQueue.getJob(projectId);
    if (await job?.isFailed()) {
      // sometimes, even with `removeOnFail` flag is still kept in a queue 🤷
      await job?.remove();
    }
    await this.underlyingQueue.add(projectId, undefined, {
      jobId: projectId,
      removeOnFail: true,
      removeOnComplete: true,
    });
  }
}
