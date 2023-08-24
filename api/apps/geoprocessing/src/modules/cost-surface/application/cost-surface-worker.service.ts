import { Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { Worker } from 'bullmq';

import { JobInput, costSurfaceQueueName } from '@marxan/artifact-cache';
import { WorkerBuilder } from '@marxan-geoprocessing/modules/worker';

import { CostSurfaceProcessor } from './cost-surface-processor.service';

@Injectable()
export class CostSurfaceWorker {
  #worker: Worker;

  constructor(
    private readonly wrapper: WorkerBuilder,
    private readonly processor: CostSurfaceProcessor,
    private readonly eventBus: EventBus,
  ) {
    this.#worker = wrapper.build(costSurfaceQueueName, processor);
  }
}
