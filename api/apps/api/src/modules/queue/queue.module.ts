import { DynamicModule, Logger, Module } from '@nestjs/common';
import { Queue, QueueEvents } from 'bullmq';
import * as config from 'config';
import { QueueService } from './queue.service';
import {
  QueueEventsToken,
  QueueLoggerToken,
  QueueNameToken,
  QueueToken,
} from './queue.tokens';

export interface QueueConfig {
  name: string;
}

@Module({})
export class QueueModule {
  static register(options: QueueConfig): DynamicModule {
    return {
      module: QueueModule,
      providers: [
        QueueService,
        {
          provide: QueueNameToken,
          useValue: options.name,
        },
        {
          provide: QueueToken,
          useFactory: () =>
            new Queue(options.name, {
              ...config.get('redisApi'),
              defaultJobOptions: config.get('jobOptions'),
            }),
        },
        {
          provide: QueueEventsToken,
          useFactory: () =>
            new QueueEvents(options.name, config.get('redisApi')),
        },
        {
          provide: QueueLoggerToken,
          useValue: new Logger(`${options.name}-queue-publisher`),
        },
      ],
      exports: [
        QueueService,
        QueueNameToken,
        QueueToken,
        QueueEventsToken,
        QueueLoggerToken,
      ],
    };
  }
}
