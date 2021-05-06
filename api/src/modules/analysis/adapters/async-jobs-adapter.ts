import { Injectable } from '@nestjs/common';
import { PlanningUnitsService } from '../../planning-units/planning-units.service';
import { RequestJobInput, RequestJobPort } from '../request-job.port';
import { JobStatusPort } from '../job-status.port';
import { AsyncJob, JobStatus } from '../async-job';

@Injectable()
export class AsyncJobsAdapter
  extends PlanningUnitsService
  implements RequestJobPort, JobStatusPort {
  constructor() {
    super();
  }

  async queue(input: RequestJobInput): Promise<AsyncJob> {
    // TODO push real job
    return {
      id: input.scenarioId,
      status: JobStatus.Pending,
    };
  }

  async scenarioStatus(scenarioId: string): Promise<AsyncJob> {
    // TODO get real status
    return {
      id: scenarioId,
      status: JobStatus.Pending,
    };
  }
}
