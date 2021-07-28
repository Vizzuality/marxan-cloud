import { Inject, Injectable } from '@nestjs/common';
import { Job, Queue } from 'bullmq';
import { Either, left, right } from 'fp-ts/Either';
import { JobData } from '@marxan/scenario-run-queue';
import { isDefined } from '@marxan/utils';
import { runQueueToken } from './tokens';

export const notFound = Symbol('not found');
export type NotFound = typeof notFound;

@Injectable()
export class CancelHandler {
  constructor(
    @Inject(runQueueToken)
    private readonly queue: Queue<JobData>,
  ) {}

  async cancel(scenarioId: string): Promise<Either<NotFound, void>> {
    const activeJobs: Job<JobData>[] = await this.queue.getJobs([
      'active',
      'waiting',
    ]);
    const scenarioJob = activeJobs.find(
      (job) => job.data.scenarioId === scenarioId,
    );
    if (!isDefined(scenarioJob)) return left(notFound);

    if (await scenarioJob.isActive())
      await scenarioJob.updateProgress({
        canceled: true,
        scenarioId,
      });
    else if (await scenarioJob.isWaiting()) await scenarioJob.remove();

    return right(void 0);
  }
}
