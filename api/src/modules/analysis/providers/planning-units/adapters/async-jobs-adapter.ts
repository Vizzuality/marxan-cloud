import { Injectable } from '@nestjs/common';

import { RequestJobInput, RequestJobPort } from '../request-job.port';
import { AsyncJob } from '../../../async-job';

import { PlanningUnitsService } from '../../../../planning-units/planning-units.service';
import { JobStatus } from '../../../../scenarios/scenario.api.entity';

@Injectable()
export class AsyncJobsAdapter
  extends PlanningUnitsService
  implements RequestJobPort {
  constructor() {
    super();
  }

  async queue(input: RequestJobInput): Promise<AsyncJob> {
    // TODO push real job
    return {
      id: input.scenarioId,
      status: JobStatus.running,
    };
  }
}
