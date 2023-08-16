import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { QueueApiEventsModule } from '@marxan-api/modules/queue-api-events';
import { ApiEventsModule } from '@marxan-api/modules/api-events';

import {
  projectProtectedAreaEventsFactoryProvider,
  projectProtectedAreaQueueEventsProvider,
  projectProtectedAreaQueueProvider,
} from './queue.providers';
import { AddProtectedAreaHandler } from './add-protected-area.handler';
import { AddProtectedAreaService } from './add-protected-area.service';




@Module({
  imports: [
    QueueApiEventsModule,
    ApiEventsModule,
    CqrsModule,
  ],
  providers: [
    AddProtectedAreaHandler,
    AddProtectedAreaService,
    projectProtectedAreaQueueProvider,
    projectProtectedAreaQueueEventsProvider,
    projectProtectedAreaEventsFactoryProvider,
  ],
  exports: [AddProtectedAreaService],
})
export class AddProtectedAreaModule {}
