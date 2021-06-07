import { Injectable } from '@nestjs/common';
import {
  WorkerBuilder,
  WorkerProcessor,
} from '@marxan-geoprocessing/modules/worker';
import { Job, Worker } from 'bullmq';
import { CostTemplateGenerator } from './cost-template-generator';
import { assertDefined } from '@marxan/utils';

export const queueName = 'cost-surface-template-creation';

@Injectable()
export class CostTemplateWorkerProcessor
  implements WorkerProcessor<void, void> {
  private readonly worker: Worker;

  constructor(
    private readonly costTemplateGenerator: CostTemplateGenerator,
    workerBuilder: WorkerBuilder,
  ) {
    this.worker = workerBuilder.build(queueName, this);
  }

  async process(job: Job<void, void>): Promise<void> {
    const jobId = job.id;
    assertDefined(jobId);
    await this.costTemplateGenerator.createTemplateShapefile(jobId);
  }
}
