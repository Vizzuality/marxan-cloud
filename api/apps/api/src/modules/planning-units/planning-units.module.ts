import { Module } from '@nestjs/common';
import { ProxyService } from '@marxan-api/modules/proxy/proxy.service';
import { PlanningUnitsController } from './planning-units.controller';
import { PlanningUnitsService } from './planning-units.service';
import { QueueModule } from '@marxan-api/modules/queue/queue.module';

@Module({
  imports: [
    QueueModule.register({
      name: 'planning-units',
    }),
  ],
  providers: [PlanningUnitsService, ProxyService],
  exports: [PlanningUnitsService],
  controllers: [PlanningUnitsController],
})
export class PlanningUnitsModule {}
