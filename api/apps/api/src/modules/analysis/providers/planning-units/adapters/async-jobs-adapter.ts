import { Injectable } from '@nestjs/common';

import { QueueService } from '@marxan-api/modules/queue/queue.service';
import { JobInput } from '@marxan-jobs/planning-unit-geometry';
import { RequestJobPort } from '../request-job.port';

@Injectable()
export class AsyncJobsAdapter implements RequestJobPort {
  constructor(private readonly queueService: QueueService<JobInput>) {}

  async queue(input: JobInput): Promise<void> {
    await this.queueService.queue.add(
      `calculate-planning-units-geo-update-${input.scenarioId}`,
      input,
    );
    return;
  }
}
