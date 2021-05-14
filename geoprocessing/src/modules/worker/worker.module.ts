import { DynamicModule, Logger, Module } from '@nestjs/common';
import { QueueScheduler, Worker, Processor } from 'bullmq';
import * as config from 'config';
import { WorkerService } from './worker.service';
import {
  QueueNameToken,
  QueueSchedulerToken,
  WorkerExecutorToken,
  WorkerLoggerToken,
} from './worker.tokens';

export interface WorkerConfig {
  name: string;
  /**
   * if path(string), then it will be executed in child process
   */
  worker: string | Processor;
}

@Module({})
export class WorkerModule {
  static register(
    options: WorkerConfig,
    providers: DynamicModule['providers'] = [],
  ): DynamicModule {
    return {
      module: WorkerModule,
      providers: [
        ...providers,
        WorkerService,
        {
          provide: QueueNameToken,
          useValue: options.name,
        },
        {
          provide: WorkerExecutorToken,
          useValue: new Worker(
            options.name,
            options.worker,
            config.get('redisApi'),
          ),
        },
        {
          provide: QueueSchedulerToken,
          useValue: new QueueScheduler(options.name, config.get('redisApi')),
        },
        {
          provide: WorkerLoggerToken,
          useValue: new Logger(`${options.name}-worker`),
        },
      ],
      exports: [
        WorkerService,
        QueueNameToken,
        WorkerExecutorToken,
        QueueSchedulerToken,
        WorkerLoggerToken,
      ],
    };
  }
}
