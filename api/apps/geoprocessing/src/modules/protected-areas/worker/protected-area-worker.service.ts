import { Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { Job, Worker } from 'bullmq';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { addProtectedAreaQueueName, JobInput } from '@marxan/protected-areas';
import { WorkerBuilder } from '../../worker';
import { ProtectedAreaProcessor } from './protected-area-processor';
import { ApiEvent } from '@marxan-geoprocessing/modules/api-events';

@Injectable()
export class ProtectedAreaWorkerService {
  #worker: Worker;

  constructor(
    private readonly wrapper: WorkerBuilder,
    private readonly processor: ProtectedAreaProcessor,
    private readonly eventBus: EventBus,
  ) {
    this.#worker = wrapper.build(addProtectedAreaQueueName, processor);
    this.#worker.on('completed', ({ data }: { data: JobInput }) => {
      this.eventBus.publish(
        new ApiEvent(
          data.projectId,
          API_EVENT_KINDS.project__protectedAreas__finished__v1__alpha,
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
            data.projectId,
            API_EVENT_KINDS.project__protectedAreas__failed__v1__alpha,
            {
              error: failedReason,
            },
          ),
        );
      },
    );
  }
}
