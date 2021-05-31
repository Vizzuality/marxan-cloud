import { Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { Job, Worker } from 'bullmq';
import { WorkerBuilder } from '../../worker';
import { ProtectedAreaProcessor } from './protected-area-processor';
import { queueName } from './queue-name';
import { ApiEvent } from '../../api-events';
import { ProtectedAreasJobInput } from './worker-input';
import { API_EVENT_KINDS } from '../../api-events/events.enum';

@Injectable()
export class ProtectedAreaWorkerService {
  #worker: Worker;

  constructor(
    private readonly wrapper: WorkerBuilder,
    private readonly processor: ProtectedAreaProcessor,
    private readonly eventBus: EventBus,
  ) {
    this.#worker = wrapper.build(queueName, processor);
    this.#worker.on(
      'completed',
      ({ data }: { data: ProtectedAreasJobInput }) => {
        this.eventBus.publish(
          new ApiEvent(
            data.projectId,
            API_EVENT_KINDS.project__protectedAreas__finished__v1__alpha,
          ),
        );
      },
    );
    this.#worker.on(
      'failed',
      ({
        data,
        failedReason,
        attemptsMade,
        opts,
      }: Job<ProtectedAreasJobInput>) => {
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
