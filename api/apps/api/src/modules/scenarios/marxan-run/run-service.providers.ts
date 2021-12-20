import { FactoryProvider } from '@nestjs/common';
import { Queue, QueueEvents } from 'bullmq';
import {
  JobData as RunJobData,
  queueName as runQueueName,
} from '@marxan/scenario-run-queue';
import { MarxanParametersDefaults } from '@marxan/marxan-input';
import { QueueBuilder, QueueEventsBuilder } from '@marxan-api/modules/queue';
import { blmDefaultToken, runEventsToken, runQueueToken } from './tokens';

export const runQueueProvider: FactoryProvider<Queue<RunJobData>> = {
  provide: runQueueToken,
  useFactory: (queueBuilder: QueueBuilder<RunJobData>) => {
    return queueBuilder.buildQueue(runQueueName);
  },
  inject: [QueueBuilder],
};

export const runQueueEventsProvider: FactoryProvider<QueueEvents> = {
  provide: runEventsToken,
  useFactory: (eventsBuilder: QueueEventsBuilder) => {
    return eventsBuilder.buildQueueEvents(runQueueName);
  },
  inject: [QueueEventsBuilder],
};

export const blmDefaultProvider: FactoryProvider<number> = {
  provide: blmDefaultToken,
  useFactory: () => {
    const defaults = new MarxanParametersDefaults();
    return defaults.BLM;
  },
};
