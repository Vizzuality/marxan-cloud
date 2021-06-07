import { Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { Job, Worker } from 'bullmq';

import {
  API_EVENT_KINDS,
  ApiEvent,
} from '@marxan-geoprocessing/modules/api-events';
import { WorkerBuilder } from '@marxan-geoprocessing/modules/worker';

import { CostSurfaceJobInput } from '../cost-surface-job-input';

import { queueName } from './queue-name';
import { SurfaceCostProcessor } from './surface-cost-processor';

@Injectable()
export class SurfaceCostWorker {
  #worker: Worker;

  constructor(
    private readonly wrapper: WorkerBuilder,
    private readonly processor: SurfaceCostProcessor,
    private readonly eventBus: EventBus,
  ) {
    this.#worker = wrapper.build(queueName, processor);
    this.#worker.on('completed', ({ data }: Job<CostSurfaceJobInput>) => {
      this.eventBus.publish(
        new ApiEvent(
          data.scenarioId,
          API_EVENT_KINDS.scenario__costSurface__finished__v1_alpha1,
        ),
      );
    });
    this.#worker.on(
      'failed',
      ({
        data,
        failedReason,
        attemptsMade,
        opts,
      }: Job<CostSurfaceJobInput>) => {
        if (attemptsMade !== opts.attempts) {
          return;
        }
        this.eventBus.publish(
          new ApiEvent(
            data.scenarioId,
            API_EVENT_KINDS.scenario__costSurface__costUpdateFailed__v1_alpha1,
            {
              error: failedReason,
            },
          ),
        );
      },
    );
  }
}
