import { Module } from '@nestjs/common';
import { QueueModule } from '@marxan-api/modules/queue/queue.module';

import { PlanningUnitsService } from './planning-units.service';

@Module({
  imports: [
    QueueModule.register({
      name: 'planning-units',
    }),
  ],
  providers: [PlanningUnitsService],
  exports: [PlanningUnitsService],
})
export class PlanningUnitsModule {}
