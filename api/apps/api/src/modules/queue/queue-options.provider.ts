import { FactoryProvider } from '@nestjs/common';
import { QueueOptions } from 'bullmq';
import * as config from 'config';
import { getRedisConfig } from '@marxan-api/utils/redisConfig.utils';
import { bullmqPrefix } from '@marxan/utils';

export const queueOptionsToken = Symbol('queue options token');
export const queueOptionsProvider: FactoryProvider<QueueOptions> = {
  provide: queueOptionsToken,
  useFactory: () => {
    return {
      ...getRedisConfig(),
      defaultJobOptions: config.get('jobOptions'),
      prefix: bullmqPrefix(),
    };
  },
};
