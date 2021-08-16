import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { QueueApiEventsModule } from '@marxan-api/modules/queue-api-events';
import { ApiEventsModule } from '@marxan-api/modules/api-events/api-events.module';
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
import { RunService } from './run.service';

@Module({
  imports: [QueueApiEventsModule, ApiEventsModule, CqrsModule],
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
    RunService,
  ],
  exports: [RunService],
})
export class ProcessingModule {}
