import { Module } from '@nestjs/common';

import { PlanningUnitsProcessor } from './planning-units.worker';
@Module({
  providers: [PlanningUnitsProcessor],
  exports: [PlanningUnitsProcessor],
})
export class PlanningUnitsModule {}
