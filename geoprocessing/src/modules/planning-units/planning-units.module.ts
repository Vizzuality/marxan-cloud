import { Module } from '@nestjs/common';

import { PlanningUnitsProcessor } from './planning-units.worker';
import { PlanningUnitsController } from './planning-units.controller';

@Module({
  providers: [PlanningUnitsProcessor],
  exports: [PlanningUnitsProcessor],
  controllers: [PlanningUnitsController],
})
export class PlanningUnitsModule {}
