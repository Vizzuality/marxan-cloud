import { Module } from '@nestjs/common';

import { PlanningUnitsProcessor } from './planning-units.worker';
import { PlanningUnitsController } from './planning-units.controller';
import { ShapeFileService } from '../shapefiles/shapefiles.service';

@Module({
  providers: [PlanningUnitsProcessor, ShapeFileService],
  exports: [PlanningUnitsProcessor],
  controllers: [PlanningUnitsController],
})
export class PlanningUnitsModule {}
