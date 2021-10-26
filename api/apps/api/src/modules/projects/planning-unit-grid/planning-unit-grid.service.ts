import { Inject, Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import { v4 } from 'uuid';
import { Either, left, right } from 'fp-ts/Either';
import { plainToClass } from 'class-transformer';

import { JobInput, Shapefile } from '@marxan/planning-units-grid';
import { ApiEventsService } from '@marxan-api/modules/api-events';

export { Shapefile } from '@marxan/planning-units-grid';
import { API_EVENT_KINDS } from '@marxan/api-events';

import { setPlanningUnitGridQueueToken } from './queue.providers';
import { ProjectId } from './project.id';
import { RequestId } from './request.id';

export const cannotSubmitRequest = Symbol(`cannot submit request to queue`);
export type setGridError = typeof cannotSubmitRequest;

@Injectable()
export class PlanningUnitGridService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    @Inject(setPlanningUnitGridQueueToken)
    private readonly queue: Queue<JobInput>,
    private readonly apiEvents: ApiEventsService,
  ) {}

  async setPlanningUnitGrid(
    projectId: ProjectId,
    shapefile: Shapefile,
  ): Promise<Either<setGridError, RequestId>> {
    try {
      const jobId = v4();
      const payload = plainToClass<JobInput, JobInput>(JobInput, {
        requestId: jobId,
        projectId: projectId.value,
        shapefile,
      });
      await this.queue.add(`set-grid-for-${projectId.value}`, payload, {
        jobId,
      });
      await this.apiEvents.create({
        kind: API_EVENT_KINDS.project__grid__submitted__v1__alpha,
        topic: projectId.value,
        externalId: jobId,
        data: {
          payload,
        },
      });
      return right(new RequestId(jobId));
    } catch (error) {
      this.logger.error(error);
      return left(cannotSubmitRequest);
    }
  }
}
