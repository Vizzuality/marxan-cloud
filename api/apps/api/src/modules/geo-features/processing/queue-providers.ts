import { FactoryProvider } from '@nestjs/common';
import { Queue, QueueEvents } from 'bullmq';
import {
  FeaturesJobData,
  copyQueueName,
  splitQueueName,
  stratificationQueueName,
} from '@marxan/geofeature-calculations';
import { QueueBuilder, QueueEventsBuilder } from '@marxan-api/modules/queue';
import {
  CreateWithEventFactory,
  QueueEventsAdapterFactory,
} from '@marxan-api/modules/queue-api-events';

export const copyQueueToken = Symbol('copy queue token');
export const copyQueueProvider: FactoryProvider<Queue<FeaturesJobData>> = {
  provide: copyQueueToken,
  useFactory: (queueBuilder: QueueBuilder) => {
    return queueBuilder.buildQueue(copyQueueName);
  },
  inject: [QueueBuilder],
};

export const copyQueueEventsToken = Symbol('copy queue events token');
export const copyQueueEventsProvider: FactoryProvider<QueueEvents> = {
  provide: copyQueueEventsToken,
  useFactory: (queueEventsBuilder: QueueEventsBuilder) => {
    return queueEventsBuilder.buildQueueEvents(copyQueueName);
  },
  inject: [QueueEventsBuilder],
};

export const copyEventsFactoryToken = Symbol('copy event factory token');
export const copyEventsFactoryProvider: FactoryProvider<
  CreateWithEventFactory<FeaturesJobData>
> = {
  provide: copyEventsFactoryToken,
  useFactory: (
    factory: QueueEventsAdapterFactory,
    queue: Queue<FeaturesJobData>,
    queueEvents: QueueEvents,
  ) => {
    return factory.create(queue, queueEvents);
  },
  inject: [QueueEventsAdapterFactory, copyQueueToken, copyQueueEventsToken],
};
export const splitQueueToken = Symbol('split queue token');
export const splitQueueProvider: FactoryProvider<Queue<FeaturesJobData>> = {
  provide: splitQueueToken,
  useFactory: (queueBuilder: QueueBuilder) => {
    return queueBuilder.buildQueue(splitQueueName);
  },
  inject: [QueueBuilder],
};

export const splitQueueEventsToken = Symbol('split queue events token');
export const splitQueueEventsProvider: FactoryProvider<QueueEvents> = {
  provide: splitQueueEventsToken,
  useFactory: (queueEventsBuilder: QueueEventsBuilder) => {
    return queueEventsBuilder.buildQueueEvents(splitQueueName);
  },
  inject: [QueueEventsBuilder],
};

export const splitEventsFactoryToken = Symbol('split event factory token');
export const splitEventsFactoryProvider: FactoryProvider<
  CreateWithEventFactory<FeaturesJobData>
> = {
  provide: splitEventsFactoryToken,
  useFactory: (
    factory: QueueEventsAdapterFactory,
    queue: Queue<FeaturesJobData>,
    queueEvents: QueueEvents,
  ) => {
    return factory.create(queue, queueEvents);
  },
  inject: [QueueEventsAdapterFactory, splitQueueToken, splitQueueEventsToken],
};
export const stratificationQueueToken = Symbol('stratification queue token');
export const stratificationQueueProvider: FactoryProvider<
  Queue<FeaturesJobData>
> = {
  provide: stratificationQueueToken,
  useFactory: (queueBuilder: QueueBuilder) => {
    return queueBuilder.buildQueue(stratificationQueueName);
  },
  inject: [QueueBuilder],
};

export const stratificationQueueEventsToken = Symbol(
  'stratification queue events token',
);
export const stratificationQueueEventsProvider: FactoryProvider<QueueEvents> = {
  provide: stratificationQueueEventsToken,
  useFactory: (queueEventsBuilder: QueueEventsBuilder) => {
    return queueEventsBuilder.buildQueueEvents(stratificationQueueName);
  },
  inject: [QueueEventsBuilder],
};

export const stratificationEventsFactoryToken = Symbol(
  'stratification event factory token',
);
export const stratificationEventsFactoryProvider: FactoryProvider<
  CreateWithEventFactory<FeaturesJobData>
> = {
  provide: stratificationEventsFactoryToken,
  useFactory: (
    factory: QueueEventsAdapterFactory,
    queue: Queue<FeaturesJobData>,
    queueEvents: QueueEvents,
  ) => {
    return factory.create(queue, queueEvents);
  },
  inject: [
    QueueEventsAdapterFactory,
    stratificationQueueToken,
    stratificationQueueEventsToken,
  ],
};
