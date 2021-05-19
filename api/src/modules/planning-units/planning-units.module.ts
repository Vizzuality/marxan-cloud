import { Module } from '@nestjs/common';

import { PlanningUnitsService } from './planning-units.service';
@Module({
  providers: [PlanningUnitsService],
  exports: [PlanningUnitsService],
})
export class PlanningUnitsModule {}
