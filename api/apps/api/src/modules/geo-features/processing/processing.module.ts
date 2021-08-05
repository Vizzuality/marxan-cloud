import { Module } from '@nestjs/common';
import { QueueApiEventsModule } from '@marxan-api/modules/queue-api-events';
import {
  copyEventsFactoryProvider,
  copyQueueEventsProvider,
  copyQueueProvider,
  splitEventsFactoryProvider,
  splitQueueEventsProvider,
  splitQueueProvider,
  stratificationEventsFactoryProvider,
  stratificationQueueEventsProvider,
  stratificationQueueProvider,
} from './queue-providers';
import { CopyEventsHandler } from './copy-events.handler';
import { SplitEventsHandler } from './split-events.handler';
import { StratificationEventsHandler } from './stratification-events.handler';

@Module({
  imports: [QueueApiEventsModule],
  providers: [
    copyQueueProvider,
    copyQueueEventsProvider,
    copyEventsFactoryProvider,
    splitQueueProvider,
    splitQueueEventsProvider,
    splitEventsFactoryProvider,
    stratificationQueueProvider,
    stratificationQueueEventsProvider,
    stratificationEventsFactoryProvider,
    CopyEventsHandler,
    SplitEventsHandler,
    StratificationEventsHandler,
  ],
  exports: [],
})
export class ProcessingModule {}
