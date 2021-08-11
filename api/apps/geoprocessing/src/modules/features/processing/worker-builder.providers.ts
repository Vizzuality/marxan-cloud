import { FactoryProvider, ValueProvider } from '@nestjs/common';
import {
  copyQueueName,
  splitQueueName,
  stratificationQueueName,
} from '@marxan/geofeature-calculations';
import {
  QueueEventsBuilder,
  WorkerBuilder,
} from '@marxan-geoprocessing/modules/worker';
import { QueueEvents } from 'bullmq';

export const copyQueueNameToken = Symbol('copy queue token');
export const copyQueueNameProvider: ValueProvider<string> = {
  provide: copyQueueNameToken,
  useValue: copyQueueName,
};
export const copyWorkerBuilderToken = Symbol('copy worker builder token');
export const copyWorkerBuilderProvider: FactoryProvider<WorkerBuilder> = {
  provide: copyWorkerBuilderToken,
  useFactory: (builder: WorkerBuilder) => builder,
  inject: [WorkerBuilder],
};

export const copyQueueEventsToken = Symbol('copy queue events token');
export const copyQueueEventsProvider: FactoryProvider<QueueEvents> = {
  provide: copyQueueEventsToken,
  useFactory: (queueEventsBuilder: QueueEventsBuilder, queueName: string) =>
    queueEventsBuilder.buildQueueEvents(queueName),
  inject: [QueueEventsBuilder, copyQueueNameToken],
};

export const splitQueueNameToken = Symbol('split queue token');
export const splitQueueNameProvider: ValueProvider<string> = {
  provide: splitQueueNameToken,
  useValue: splitQueueName,
};
export const splitWorkerBuilderToken = Symbol('split worker builder token');
export const splitWorkerBuilderProvider: FactoryProvider<WorkerBuilder> = {
  provide: splitWorkerBuilderToken,
  useFactory: (builder: WorkerBuilder) => builder,
  inject: [WorkerBuilder],
};

export const splitQueueEventsToken = Symbol('split queue events token');
export const splitQueueEventsProvider: FactoryProvider<QueueEvents> = {
  provide: splitQueueEventsToken,
  useFactory: (queueEventsBuilder: QueueEventsBuilder, queueName: string) =>
    queueEventsBuilder.buildQueueEvents(queueName),
  inject: [QueueEventsBuilder, splitQueueNameToken],
};

export const stratificationQueueNameToken = Symbol(
  'stratification queue token',
);
export const stratificationQueueNameProvider: ValueProvider<string> = {
  provide: stratificationQueueNameToken,
  useValue: stratificationQueueName,
};
export const stratificationWorkerBuilderToken = Symbol(
  'stratification worker builder token',
);
export const stratificationWorkerBuilderProvider: FactoryProvider<WorkerBuilder> = {
  provide: stratificationWorkerBuilderToken,
  useFactory: (builder: WorkerBuilder) => builder,
  inject: [WorkerBuilder],
};

export const stratificationQueueEventsToken = Symbol(
  'stratification queue events token',
);
export const stratificationQueueEventsProvider: FactoryProvider<QueueEvents> = {
  provide: stratificationQueueEventsToken,
  useFactory: (queueEventsBuilder: QueueEventsBuilder, queueName: string) =>
    queueEventsBuilder.buildQueueEvents(queueName),
  inject: [QueueEventsBuilder, stratificationQueueNameToken],
};
