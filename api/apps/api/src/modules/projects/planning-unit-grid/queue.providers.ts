import { FactoryProvider } from '@nestjs/common';
import { Queue, QueueEvents } from 'bullmq';

import { QueueBuilder, QueueEventsBuilder } from '@marxan-api/modules/queue';
import { JobInput, JobOutput, queueName } from '@marxan/planning-units-grid';
import {
  CreateWithEventFactory,
  QueueEventsAdapterFactory,
} from '@marxan-api/modules/queue-api-events';

export const setPlanningUnitGridQueueToken = Symbol(
  `set planning unit grid queue token`,
);
export const setPlanningUnitGridQueueProvider: FactoryProvider<
  Queue<JobInput, JobOutput>
> = {
  provide: setPlanningUnitGridQueueToken,
  useFactory: (queueBuilder: QueueBuilder) => {
    return queueBuilder.buildQueue(queueName);
  },
  inject: [QueueBuilder],
};

export const setPlanningUnitGridQueueEventsToken = Symbol(
  `set planning unit grid queue events token`,
);
export const setPlanningUnitGridQueueEventsProvider: FactoryProvider<QueueEvents> = {
  provide: setPlanningUnitGridQueueEventsToken,
  useFactory: (queueEventsBuilder: QueueEventsBuilder) => {
    return queueEventsBuilder.buildQueueEvents(queueName);
  },
  inject: [QueueEventsBuilder],
};

export const setPlanningUnitGridEventsFactoryToken = Symbol(
  `set planning unit grid queue events factory token`,
);
export const setPlanningUnitGridEventsFactoryProvider: FactoryProvider<
  CreateWithEventFactory<JobInput, JobOutput>
> = {
  provide: setPlanningUnitGridEventsFactoryToken,
  useFactory: (
    factory: QueueEventsAdapterFactory,
    queue: Queue<JobInput, JobOutput>,
    queueEvents: QueueEvents,
  ) => {
    return factory.create(queue, queueEvents);
  },
  inject: [
    QueueEventsAdapterFactory,
    setPlanningUnitGridQueueToken,
    setPlanningUnitGridQueueEventsToken,
  ],
};
