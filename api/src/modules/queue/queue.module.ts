import { DynamicModule, Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { QueueNameToken } from './queue.tokens';

export interface QueueConfig {
  name: string;
}

@Module({})
export class QueueModule {
  static register(options: QueueConfig): DynamicModule {
    return {
      module: QueueModule,
      providers: [
        {
          provide: QueueNameToken,
          useValue: options.name,
        },
      ],
      exports: [QueueService],
    };
  }
}
