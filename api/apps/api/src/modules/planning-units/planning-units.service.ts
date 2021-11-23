import { Inject, Injectable, Logger } from '@nestjs/common';

import { Queue } from 'bullmq';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { ApiEventsService } from '@marxan-api/modules/api-events';
import { PlanningUnitsJob } from '@marxan-jobs/planning-unit-geometry';

import { queueToken } from './planning-units-queue.provider';

@Injectable()
export class PlanningUnitsService {
  private readonly logger = new Logger(PlanningUnitsService.name);

  constructor(
    @Inject(queueToken)
    private readonly queue: Queue<PlanningUnitsJob, void>,
    private readonly events: ApiEventsService,
  ) {}

  async create(jobDefinition: PlanningUnitsJob) {
    const kind = API_EVENT_KINDS.project__planningUnits__submitted__v1__alpha;
    const job = await this.queue.add(`create-regular-pu`, jobDefinition);

    // bad typing - may happen that job wasn't added
    if (!job) {
      this.logger.error(
        `Unable to start job PlanningUnitsJob - adding job failed.`,
      );
      return;
    }

    await this.events.create({
      kind,
      topic: jobDefinition.projectId,
    });
  }
}
