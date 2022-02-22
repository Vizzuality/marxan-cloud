import { QueueBuilder, QueueEventsBuilder } from '@marxan-api/modules/queue';
import {
  CreateWithEventFactory,
  QueueEventsAdapterFactory,
} from '@marxan-api/modules/queue-api-events';
import { JobInput, surfaceCostQueueName } from '@marxan/scenario-cost-surface';
import { FactoryProvider } from '@nestjs/common';
import { Queue, QueueEvents } from 'bullmq';

export const surfaceCostQueueToken = Symbol('export piece queue token');
export const surfaceCostEventsToken = Symbol('export piece events token');
export const surfaceCostEventsFactoryToken = Symbol(
  'export piece queue' + ' factory token',
);

export const surfaceCostQueueProvider: FactoryProvider<Queue<JobInput>> = {
  provide: surfaceCostQueueToken,
  useFactory: (queueBuilder: QueueBuilder<JobInput>) => {
    return queueBuilder.buildQueue(surfaceCostQueueName);
  },
  inject: [QueueBuilder],
};
export const surfaceCostQueueEventsProvider: FactoryProvider<QueueEvents> = {
  provide: surfaceCostEventsToken,
  useFactory: (eventsBuilder: QueueEventsBuilder) => {
    return eventsBuilder.buildQueueEvents(surfaceCostQueueName);
  },
  inject: [QueueEventsBuilder],
};

export const surfaceCostEventsFactoryProvider: FactoryProvider<
  CreateWithEventFactory<JobInput>
> = {
  provide: surfaceCostEventsFactoryToken,
  useFactory: (
    factory: QueueEventsAdapterFactory,
    queue: Queue<JobInput>,
    queueEvents: QueueEvents,
  ) => factory.create(queue, queueEvents),
  inject: [
    QueueEventsAdapterFactory,
    surfaceCostQueueToken,
    surfaceCostEventsToken,
  ],
};
