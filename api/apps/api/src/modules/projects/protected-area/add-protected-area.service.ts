import { Inject, Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { Either, left, right } from 'fp-ts/Either';

import { JobOutput } from '@marxan/protected-areas';
import { API_EVENT_KINDS } from '@marxan/api-events';

import { ApiEventsService } from '@marxan-api/modules/api-events';

import { projectProtectedAreaQueueToken } from './queue.providers';
import {JobInput} from "@marxan/protected-areas/add-protected-area-to-project-input";

export const submissionFailed = Symbol(
  `System could not submit the async job.`,
);

@Injectable()
export class AddProtectedAreaService {
  constructor(
    @Inject(projectProtectedAreaQueueToken)
    private readonly queue: Queue<JobInput, JobOutput>,
    private readonly apiEvents: ApiEventsService,
  ) {}

  async addShapeFor(
    projectId: string,
    shapefile: JobInput['shapefile'],
    name: JobInput['name'],
  ): Promise<Either<typeof submissionFailed, true>> {
    const job = await this.queue.add(`add-protected-area`, {
      projectId,
      shapefile,
      name,
    });

    // bad typing? may happen that job wasn't added
    if (!job) {
      return left(submissionFailed);
    }

    const kind = API_EVENT_KINDS.project__protectedAreas__submitted__v1__alpha;
    try {
      await this.apiEvents.create({
        kind,
        topic: projectId,
        data: {
          kind,
          projectId,
          name,
        },
      });
    } catch (error: unknown) {
      return left(submissionFailed);
    }

    return right(true);
  }


}
