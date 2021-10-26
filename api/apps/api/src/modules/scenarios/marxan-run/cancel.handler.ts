import { Inject, Injectable } from '@nestjs/common';
import { Job, Queue } from 'bullmq';
import { Either, right } from 'fp-ts/Either';
import { ApiEventsService } from '@marxan-api/modules/api-events/api-events.service';
import { JobData } from '@marxan/scenario-run-queue';
import { isDefined } from '@marxan/utils';
import { runQueueToken } from './tokens';
import { API_EVENT_KINDS } from '@marxan/api-events';

export const notFound = Symbol('not found');
export type NotFound = typeof notFound;

@Injectable()
export class CancelHandler {
  constructor(
    @Inject(runQueueToken)
    private readonly queue: Queue<JobData>,
    private readonly apiEvents: ApiEventsService,
  ) {}

  async cancel(scenarioId: string): Promise<Either<NotFound, void>> {
    const activeJobs: Job<JobData>[] = await this.queue.getJobs([
      'active',
      'waiting',
    ]);
    const scenarioJob = activeJobs.find(
      (job) => job.data.scenarioId === scenarioId,
    );
    if (!isDefined(scenarioJob)) {
      await this.apiEvents.create({
        topic: scenarioId,
        kind: API_EVENT_KINDS.scenario__run__failed__v1__alpha1,
      });
      return right(void 0);
    }

    if (await scenarioJob.isActive())
      await scenarioJob.updateProgress({
        canceled: true,
        scenarioId,
      });
    else if (await scenarioJob.isWaiting()) await scenarioJob.remove();

    return right(void 0);
  }
}
