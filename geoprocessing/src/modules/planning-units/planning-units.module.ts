import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TileModule } from 'src/modules/tile/tile.module';
import { PlanningUnitsProcessor } from './planning-units.worker';
import { PlanningUnitsController } from './planning-units.controller';
import { ShapeFileService } from '../shapefiles/shapefiles.service';
import { PlanningUnitsGeom } from 'src/modules/planning-units/planning-units.geo.entity';
import { PlanningUnitsService } from './planning-units.service';

@Module({
  imports: [TypeOrmModule.forFeature([PlanningUnitsGeom]), TileModule],
  providers: [
    PlanningUnitsProcessor,
    ShapeFileService,
    PlanningUnitsService,
    Logger,
  ],
  controllers: [PlanningUnitsController],
  exports: [PlanningUnitsProcessor, PlanningUnitsService],
})
export class PlanningUnitsModule {}
