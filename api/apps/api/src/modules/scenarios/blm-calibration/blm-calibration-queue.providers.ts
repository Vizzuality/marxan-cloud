import { FactoryProvider } from '@nestjs/common';
import { Queue, QueueEvents } from 'bullmq';
import { blmCalibrationQueueName, JobData } from '@marxan/blm-calibration';
import { QueueBuilder, QueueEventsBuilder } from '../../queue';
import {
  CreateWithEventFactory,
  QueueEventsAdapterFactory,
} from '../../queue-api-events';

export const calibrationQueueToken = Symbol('calibration queue token');

export const calibrationQueueProvider: FactoryProvider<Queue<JobData>> = {
  provide: calibrationQueueToken,
  useFactory: (queueBuilder: QueueBuilder<JobData>) => {
    return queueBuilder.buildQueue(blmCalibrationQueueName);
  },
  inject: [QueueBuilder],
};

export const calibrationEventsToken = Symbol('calibration events token');

export const calibrationQueueEventsProvider: FactoryProvider<QueueEvents> = {
  provide: calibrationEventsToken,
  useFactory: (eventsBuilder: QueueEventsBuilder) => {
    return eventsBuilder.buildQueueEvents(blmCalibrationQueueName);
  },
  inject: [QueueEventsBuilder],
};

export const calibrationQueueEventsFactoryToken = Symbol(
  `calibration queue events factory token`,
);

export const calibrationQueueEventsFactoryProvider: FactoryProvider<
  CreateWithEventFactory<JobData>
> = {
  provide: calibrationQueueEventsFactoryToken,
  useFactory: (
    factory: QueueEventsAdapterFactory,
    queue: Queue<JobData>,
    queueEvents: QueueEvents,
  ) => factory.create(queue, queueEvents),
  inject: [
    QueueEventsAdapterFactory,
    calibrationQueueToken,
    calibrationEventsToken,
  ],
};
