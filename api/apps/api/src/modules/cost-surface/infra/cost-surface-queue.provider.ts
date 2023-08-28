import { QueueBuilder, QueueEventsBuilder } from '@marxan-api/modules/queue';
import {
  CreateWithEventFactory,
  QueueEventsAdapterFactory,
} from '@marxan-api/modules/queue-api-events';
import { JobInput, costSurfaceQueueName } from '@marxan/artifact-cache';
import { FactoryProvider } from '@nestjs/common';
import { Queue, QueueEvents } from 'bullmq';

export const costSurfaceQueueToken = Symbol('export piece queue token');
export const costSurfaceEventsToken = Symbol('export piece events token');
export const CostSurfaceFactoryToken = Symbol(
  'export piece queue' + ' factory token',
);

export const costSurfaceQueueProvider: FactoryProvider<Queue<JobInput>> = {
  provide: costSurfaceQueueToken,
  useFactory: (queueBuilder: QueueBuilder<JobInput>) => {
    return queueBuilder.buildQueue(costSurfaceQueueName);
  },
  inject: [QueueBuilder],
};
export const costSurfaceQueueEventsProvider: FactoryProvider<QueueEvents> = {
  provide: costSurfaceEventsToken,
  useFactory: (eventsBuilder: QueueEventsBuilder) => {
    return eventsBuilder.buildQueueEvents(costSurfaceQueueName);
  },
  inject: [QueueEventsBuilder],
};

export const costSurfaceEventsFactoryProvider: FactoryProvider<
  CreateWithEventFactory<JobInput>
> = {
  provide: CostSurfaceFactoryToken,
  useFactory: (
    factory: QueueEventsAdapterFactory,
    queue: Queue<JobInput>,
    queueEvents: QueueEvents,
  ) => factory.create(queue, queueEvents),
  inject: [
    QueueEventsAdapterFactory,
    costSurfaceQueueToken,
    costSurfaceEventsToken,
  ],
};
