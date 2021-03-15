import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';

import { PlanningUnitsService } from './planning-units.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'planning-units',
    }),
  ],
  providers: [PlanningUnitsService],
  exports: [PlanningUnitsService],
})
export class PlanningUnitsModule {}
