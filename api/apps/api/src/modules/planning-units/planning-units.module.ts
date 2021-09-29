import { Module } from '@nestjs/common';
import { ProxyService } from '@marxan-api/modules/proxy/proxy.service';
import { PlanningUnitsController } from './planning-units.controller';
import {
  PlanningUnitsService,
  queueEventsProvider,
  queueProvider,
} from './planning-units.service';
import { QueueModule } from '@marxan-api/modules/queue/queue.module';
import { ApiEventsModule } from '@marxan-api/modules/api-events';

@Module({
  imports: [QueueModule.register(), ApiEventsModule],
  providers: [
    PlanningUnitsService,
    ProxyService,
    queueProvider,
    queueEventsProvider,
  ],
  exports: [PlanningUnitsService],
  controllers: [PlanningUnitsController],
})
export class PlanningUnitsModule {}
