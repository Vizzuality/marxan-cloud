import { Injectable } from '@nestjs/common';
import { Worker } from 'bullmq';
import { WorkerBuilder, WorkerProcessor } from '../../worker';
import { CostSurfaceJobInput } from '../cost-surface-job-input';

import { queueName } from './queue-name';

@Injectable()
export class SurfaceCostWorker {
  #worker: Worker;

  constructor(
    private readonly wrapper: WorkerBuilder,
    private readonly processor: WorkerProcessor<CostSurfaceJobInput, true>,
  ) {
    this.#worker = wrapper.build(queueName, processor);
    this.#worker.on('completed', ({ returnvalue }) => {
      // TODO ApiEvent
    });
    this.#worker.on('failed', ({ failedReason }) => {
      // TODO ApiEvent
    });
  }
}
