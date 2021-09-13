import { FactoryProvider } from '@nestjs/common';
import { Queue, QueueEvents } from 'bullmq';
import { QueueBuilder, QueueEventsBuilder } from '@marxan-api/modules/queue';
import {
  CreateWithEventFactory,
  QueueEventsAdapterFactory,
} from '@marxan-api/modules/queue-api-events';

// TODO replace with proper type
export type JobInput = { scenarioId: string };
// TODO replace with proper queueName
const queueName = `${Date.now()}`;

export const intersectFeaturesWithPuQueueToken = Symbol(
  `intersect features with pu queue token`,
);
export const intersectFeaturesWithPuQueueProvider: FactoryProvider<
  Queue<JobInput>
> = {
  provide: intersectFeaturesWithPuQueueToken,
  useFactory: (qb: QueueBuilder) => qb.buildQueue(queueName),
  inject: [QueueBuilder],
};

export const intersectFeaturesWithPuQueueEventsToken = Symbol(
  `intersect features with pu queue events token`,
);

export const intersectFeaturesWithPuQueueEventsProvider: FactoryProvider<QueueEvents> = {
  provide: intersectFeaturesWithPuQueueEventsToken,
  useFactory: (queueEventsBuilder: QueueEventsBuilder) =>
    queueEventsBuilder.buildQueueEvents(queueName),
  inject: [QueueEventsBuilder],
};

export const intersectFeaturesWithPuQueueEventsFactoryToken = Symbol(
  `intersect features with pu queue events factory token`,
);

export const setPlanningUnitGridEventsFactoryProvider: FactoryProvider<
  CreateWithEventFactory<JobInput>
> = {
  provide: intersectFeaturesWithPuQueueEventsFactoryToken,
  useFactory: (
    factory: QueueEventsAdapterFactory,
    queue: Queue<JobInput, void>,
    queueEvents: QueueEvents,
  ) => factory.create(queue, queueEvents),
  inject: [
    QueueEventsAdapterFactory,
    intersectFeaturesWithPuQueueToken,
    intersectFeaturesWithPuQueueEventsToken,
  ],
};
