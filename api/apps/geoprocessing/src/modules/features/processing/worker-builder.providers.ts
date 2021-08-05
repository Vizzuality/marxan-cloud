import { FactoryProvider, ValueProvider } from '@nestjs/common';
import {
  copyQueueName,
  splitQueueName,
  stratificationQueueName,
} from '@marxan/geofeature-calculations';
import { WorkerBuilder } from '@marxan-geoprocessing/modules/worker';

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
