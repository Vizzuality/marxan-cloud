import { Injectable } from '@nestjs/common';

import { QueueService } from '@marxan-api/modules/queue/queue.service';
import { RequestJobInput, RequestJobPort } from '../request-job.port';

@Injectable()
export class AsyncJobsAdapter implements RequestJobPort {
  constructor(private readonly queueService: QueueService<RequestJobInput>) {}

  async queue(input: RequestJobInput): Promise<void> {
    await this.queueService.queue.add(
      `calculate-planning-units-geo-update-${input.scenarioId}`,
      input,
    );
    return;
  }
}
