import { DynamicModule, Module } from '@nestjs/common';
import { isDefined } from '@marxan/utils';
import { QueueService } from './queue.service';
import { QueueNameToken, QueueToken } from './queue.tokens';
import { QueueBuilder } from './queue.builder';
import { QueueEventsBuilder } from './queue-events.builder';
import { queueOptionsProvider } from './queue-options.provider';

export interface QueueConfig {
  name: string;
}

@Module({})
export class QueueModule {
  static register(): DynamicModule;
  /**
   * @deprecated
   */
  static register(options: QueueConfig): DynamicModule;
  static register(options?: QueueConfig): DynamicModule {
    return {
      module: QueueModule,
      providers: [
        ...this.providersForOptions(options),
        queueOptionsProvider,
        QueueBuilder,
        QueueEventsBuilder,
      ],
      exports: [
        ...this.exportsForOptions(options),
        QueueBuilder,
        QueueEventsBuilder,
      ],
    };
  }

  private static exportsForOptions(options: QueueConfig | undefined) {
    return isDefined(options) ? [QueueNameToken, QueueService, QueueToken] : [];
  }

  private static providersForOptions(options: QueueConfig | undefined) {
    return isDefined(options)
      ? [
          {
            provide: QueueNameToken,
            useValue: options.name,
          },
          {
            provide: QueueToken,
            useFactory: (
              builder: QueueBuilder<unknown, unknown>,
              name: string,
            ) => {
              return builder.buildQueue(name);
            },
            inject: [QueueBuilder, QueueNameToken],
          },
          QueueService,
        ]
      : [];
  }
}
