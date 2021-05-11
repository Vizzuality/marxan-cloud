import { Logger, Module } from '@nestjs/common';

import { PlanningUnitsProcessor } from './planning-units.worker';
import { PlanningUnitsController } from './planning-units.controller';
import { ShapeFileService } from '../shapefiles/shapefiles.service';

@Module({
  providers: [PlanningUnitsProcessor, ShapeFileService, Logger],
  exports: [PlanningUnitsProcessor],
  controllers: [PlanningUnitsController],
})
export class PlanningUnitsModule {}
