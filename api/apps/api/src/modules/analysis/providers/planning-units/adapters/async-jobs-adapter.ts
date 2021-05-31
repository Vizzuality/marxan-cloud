import { Injectable } from '@nestjs/common';

import { RequestJobInput, RequestJobPort } from '../request-job.port';
import { AsyncJob } from '../../../async-job';
import { JobStatus } from '../../../../scenarios/scenario.api.entity';
import { QueueService } from '../../../../queue/queue.service';

@Injectable()
export class AsyncJobsAdapter implements RequestJobPort {
  constructor(private readonly queueService: QueueService<RequestJobInput>) {}

  async queue(input: RequestJobInput): Promise<AsyncJob> {
    await this.queueService.queue.add(
      `calculate-planning-units-geo-update-${input.scenarioId}`,
      input,
    );
    return {
      id: input.scenarioId,
      status: JobStatus.running,
    };
  }
}
