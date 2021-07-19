import { FactoryProvider } from '@nestjs/common';
import { QueueOptions } from 'bullmq';
import * as config from 'config';

export const queueOptionsToken = Symbol('queue options token');
export const queueOptionsProvider: FactoryProvider<QueueOptions> = {
  provide: queueOptionsToken,
  useFactory: () => {
    return {
      ...config.get('redisApi'),
      defaultJobOptions: config.get('jobOptions'),
    };
  },
};
