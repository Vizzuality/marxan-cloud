import { Module } from '@nestjs/common';
import { QueueApiEventsModule } from '@marxan-api/modules/queue-api-events';
import { ApiEventsModule } from '@marxan-api/modules/api-events';
import { CqrsModule } from '@nestjs/cqrs';

import {
  setPlanningUnitGridEventsFactoryProvider,
  setPlanningUnitGridQueueEventsProvider,
  setPlanningUnitGridQueueProvider,
} from './queue.providers';
import { PlanningUnitGridEventsHandler } from './planning-unit-grid-events.handler';
import { PlanningUnitGridService } from './planning-unit-grid.service';

@Module({
  imports: [QueueApiEventsModule, ApiEventsModule, CqrsModule],
  providers: [
    setPlanningUnitGridQueueProvider,
    setPlanningUnitGridQueueEventsProvider,
    setPlanningUnitGridEventsFactoryProvider,
    PlanningUnitGridEventsHandler,
    PlanningUnitGridService,
  ],
  exports: [PlanningUnitGridService],
})
export class PlanningUnitGridModule {}
