import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { ProxyService } from '@marxan-api/modules/proxy/proxy.service';
import { QueueApiEventsModule } from '@marxan-api/modules/queue-api-events';
import { ApiEventsModule } from '@marxan-api/modules/api-events';

import { PlanningUnitsController } from './planning-units.controller';
import { PlanningUnitsService } from './planning-units.service';
import {
  queueEventsFactoryProvider,
  queueEventsProvider,
  queueProvider,
} from './planning-units-queue.provider';
import { PlanningUnitsCompletionService } from './planning-units-completion.service';

@Module({
  imports: [QueueApiEventsModule, ApiEventsModule, CqrsModule],
  providers: [
    PlanningUnitsService,
    PlanningUnitsCompletionService,
    ProxyService,
    queueProvider,
    queueEventsProvider,
    queueEventsFactoryProvider,
  ],
  exports: [PlanningUnitsService],
  controllers: [PlanningUnitsController],
})
export class PlanningUnitsModule {}
