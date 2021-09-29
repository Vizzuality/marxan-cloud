import { Injectable } from '@nestjs/common';
import { Job, Worker } from 'bullmq';
import { EventBus } from '@nestjs/cqrs';

import { WorkerBuilder } from '@marxan-geoprocessing/modules/worker';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { updateQueueName, JobInput } from '@marxan-jobs/planning-unit-geometry';

import { ScenarioPlanningUnitsInclusionProcessor } from './scenario-planning-units-inclusion-processor';
import { ApiEvent } from '../api-events';

@Injectable()
export class ScenarioPlanningUnitsInclusionWorker {
  #worker: Worker;

  constructor(
    private readonly wrapper: WorkerBuilder,
    private readonly eventBus: EventBus,
    private readonly processor: ScenarioPlanningUnitsInclusionProcessor,
  ) {
    this.#worker = wrapper.build(updateQueueName, processor);
    this.#worker.on('completed', ({ data }: Job<JobInput>) => {
      this.eventBus.publish(
        new ApiEvent(
          data.scenarioId,
          API_EVENT_KINDS.scenario__planningUnitsInclusion__finished__v1__alpha1,
        ),
      );
    });
    this.#worker.on(
      'failed',
      ({ data, failedReason, attemptsMade, opts }: Job<JobInput>) => {
        if (attemptsMade !== opts.attempts) {
          return;
        }
        this.eventBus.publish(
          new ApiEvent(
            data.scenarioId,
            API_EVENT_KINDS.scenario__planningUnitsInclusion__failed__v1__alpha1,
            {
              error: failedReason,
            },
          ),
        );
      },
    );
  }
}
