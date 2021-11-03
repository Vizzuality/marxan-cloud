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

export const scenarioProtectedAreaQueueToken = Symbol(
  'add custom protected-area to scenario-project queue token',
);
export const scenarioProtectedAreaQueueProvider: FactoryProvider<
  Queue<JobInput, JobOutput>
> = {
  provide: scenarioProtectedAreaQueueToken,
  useFactory: (queueBuilder: QueueBuilder) => {
    return queueBuilder.buildQueue(addProtectedAreaQueueName);
  },
  inject: [QueueBuilder],
};

export const scenarioProtectedAreaQueueEventsToken = Symbol(
  'add custom protected-area to scenario-project queue events token',
);
export const scenarioProtectedAreaQueueEventsProvider: FactoryProvider<QueueEvents> = {
  provide: scenarioProtectedAreaQueueEventsToken,
  useFactory: (queueEventsBuilder: QueueEventsBuilder) => {
    return queueEventsBuilder.buildQueueEvents(addProtectedAreaQueueName);
  },
  inject: [QueueEventsBuilder],
};

export const scenarioProtectedAreaEventsFactoryToken = Symbol(
  'add custom protected-area to scenario-project event factory token',
);
export const scenarioProtectedAreaEventsFactoryProvider: FactoryProvider<
  CreateWithEventFactory<JobInput, JobOutput>
> = {
  provide: scenarioProtectedAreaEventsFactoryToken,
  useFactory: (
    factory: QueueEventsAdapterFactory,
    queue: Queue<JobInput, JobOutput>,
    queueEvents: QueueEvents,
  ) => {
    return factory.create(queue, queueEvents);
  },
  inject: [
    QueueEventsAdapterFactory,
    scenarioProtectedAreaQueueToken,
    scenarioProtectedAreaQueueEventsToken,
  ],
};
