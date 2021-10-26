import { Inject, Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { Either, left, right } from 'fp-ts/Either';

import { JobInput, JobOutput } from '@marxan/protected-areas';
import { ApiEventsService } from '@marxan-api/modules/api-events';

import { scenarioProtectedAreaQueueToken } from './queue.providers';
import { API_EVENT_KINDS } from '@marxan/api-events';

export const submissionFailed = Symbol(
  `System could not submit the async job.`,
);

@Injectable()
export class ProtectedAreaService {
  constructor(
    @Inject(scenarioProtectedAreaQueueToken)
    private readonly queue: Queue<JobInput, JobOutput>,
    private readonly apiEvents: ApiEventsService,
  ) {}

  async addShapeFor(
    projectId: string,
    scenarioId: string,
    shapefile: JobInput['shapefile'],
  ): Promise<Either<typeof submissionFailed, true>> {
    const job = await this.queue.add(`add-protected-area`, {
      projectId,
      scenarioId,
      shapefile,
    });

    // bad typing? may happen that job wasn't added
    if (!job) {
      return left(submissionFailed);
    }

    const kind = API_EVENT_KINDS.project__protectedAreas__submitted__v1__alpha;
    try {
      await this.apiEvents.create({
        externalId: job.id + kind,
        kind,
        topic: scenarioId,
        data: {
          kind,
          scenarioId,
          projectId,
        },
      });
    } catch (error: unknown) {
      return left(submissionFailed);
    }

    return right(true);
  }
}
