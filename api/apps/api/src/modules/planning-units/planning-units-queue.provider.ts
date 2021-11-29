import { FactoryProvider } from '@nestjs/common';
import { Queue, QueueEvents } from 'bullmq';
import {
  createQueueName,
  PlanningUnitsJob,
} from '@marxan-jobs/planning-unit-geometry';
import { QueueBuilder, QueueEventsBuilder } from '@marxan-api/modules/queue';
import {
  CreateWithEventFactory,
  QueueEventsAdapterFactory,
} from '@marxan-api/modules/queue-api-events';

export const queueToken = Symbol(`planning unit queue token`);
export const queueProvider: FactoryProvider<Queue<PlanningUnitsJob, void>> = {
  provide: queueToken,
  useFactory: (builder: QueueBuilder) => builder.buildQueue(createQueueName),
  inject: [QueueBuilder],
};
export const queueEventsToken = Symbol(`planning units queue events token`);
export const queueEventsProvider: FactoryProvider<QueueEvents> = {
  provide: queueEventsToken,
  useFactory: (builder: QueueEventsBuilder) =>
    builder.buildQueueEvents(createQueueName),
  inject: [QueueEventsBuilder],
};
export const queueEventsFactoryToken = Symbol(
  `planning units queue factory token`,
);
export const queueEventsFactoryProvider: FactoryProvider<
  CreateWithEventFactory<PlanningUnitsJob>
> = {
  provide: queueEventsFactoryToken,
  useFactory: (
    factory: QueueEventsAdapterFactory,
    queue: Queue<PlanningUnitsJob>,
    queueEvents: QueueEvents,
  ) => factory.create(queue, queueEvents),
  inject: [QueueEventsAdapterFactory, queueToken, queueEventsToken],
};
