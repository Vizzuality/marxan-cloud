import { Inject, Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { Either, right } from 'fp-ts/Either';
import { ApiEventsService } from '@marxan-api/modules/api-events/api-events.service';
import { JobData } from '@marxan/scenario-run-queue';
import { isDefined } from '@marxan/utils';
import { runQueueToken } from './tokens';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { ScenarioJobService } from '../scenario-job/scenario-job.service';

export const notFound = Symbol('not found');
export type NotFound = typeof notFound;

@Injectable()
export class CancelHandler {
  constructor(
    @Inject(runQueueToken)
    private readonly queue: Queue<JobData>,
    private readonly apiEvents: ApiEventsService,
    private readonly scenarioJobService: ScenarioJobService,
  ) {}

  async cancel(scenarioId: string): Promise<Either<NotFound, void>> {
    const scenarioJob = await this.scenarioJobService.getScenarioJob(
      this.queue,
      scenarioId,
      ['active', 'waiting'],
    );

    if (!isDefined(scenarioJob)) {
      await this.apiEvents.create({
        topic: scenarioId,
        kind: API_EVENT_KINDS.scenario__run__failed__v1__alpha1,
      });
      return right(void 0);
    }

    await this.scenarioJobService.cancelScenarioJob(scenarioJob);

    return right(void 0);
  }
}
