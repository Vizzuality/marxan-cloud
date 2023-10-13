import { FactoryProvider } from '@nestjs/common';
import { Queue, QueueEvents } from 'bullmq';

import { QueueBuilder, QueueEventsBuilder } from '@marxan-api/modules/queue';
import {
  CreateWithEventFactory,
  QueueEventsAdapterFactory,
} from '@marxan-api/modules/queue-api-events';

import {
  addProtectedAreaQueueName,
  JobInput,
  JobOutput,
} from '@marxan/protected-areas';

export const projectProtectedAreaQueueToken = Symbol(
  'add custom protected-area to project queue token',
);
export const projectProtectedAreaQueueProvider: FactoryProvider<
  Queue<JobInput, JobOutput>
> = {
  provide: projectProtectedAreaQueueToken,
  useFactory: (queueBuilder: QueueBuilder) => {
    return queueBuilder.buildQueue(addProtectedAreaQueueName);
  },
  inject: [QueueBuilder],
};

export const projectProtectedAreaQueueEventsToken = Symbol(
  'add custom protected-area to project queue events token',
);
export const projectProtectedAreaQueueEventsProvider: FactoryProvider<QueueEvents> =
  {
    provide: projectProtectedAreaQueueEventsToken,
    useFactory: (queueEventsBuilder: QueueEventsBuilder) => {
      return queueEventsBuilder.buildQueueEvents(addProtectedAreaQueueName);
    },
    inject: [QueueEventsBuilder],
  };

export const projectProtectedAreaEventsFactoryToken = Symbol(
  'add custom protected-area to project event factory token',
);
export const projectProtectedAreaEventsFactoryProvider: FactoryProvider<
  CreateWithEventFactory<JobInput, JobOutput>
> = {
  provide: projectProtectedAreaEventsFactoryToken,
  useFactory: (
    factory: QueueEventsAdapterFactory,
    queue: Queue<JobInput, JobOutput>,
    queueEvents: QueueEvents,
  ) => {
    return factory.create(queue, queueEvents);
  },
  inject: [
    QueueEventsAdapterFactory,
    projectProtectedAreaQueueToken,
    projectProtectedAreaQueueEventsToken,
  ],
};
