import { Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { Worker } from 'bullmq';
import { WorkerBuilder } from '@marxan-geoprocessing/modules/worker';
import { scenarioCostSurfaceQueueName } from '@marxan/artifact-cache/cost-surface-queue-name';
import { ScenarioCostSurfaceProcessor } from '@marxan-geoprocessing/modules/cost-surface/application/scenario-cost-surface-processor.service';

@Injectable()
export class ScenarioCostSurfaceWorker {
  #worker: Worker;

  constructor(
    private readonly wrapper: WorkerBuilder,
    private readonly processor: ScenarioCostSurfaceProcessor,
  ) {
    this.#worker = wrapper.build(scenarioCostSurfaceQueueName, processor);
  }
}
