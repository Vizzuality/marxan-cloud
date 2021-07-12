import { Logger, Module } from '@nestjs/common';
import { TileModule } from '@marxan-geoprocessing/modules/tile/tile.module';
import { PlanningUnitsProcessor } from './planning-units.worker';
import { PlanningUnitsController } from './planning-units.controller';
import { ShapefileService } from '../shapefiles/shapefiles.service';
import { PlanningUnitsService } from './planning-units.service';
import { FileService } from '../files/files.service';
import { WorkerModule } from '../worker';

@Module({
  imports: [TileModule, WorkerModule],
  providers: [
    PlanningUnitsProcessor,
    ShapefileService,
    FileService,
    PlanningUnitsService,
    Logger,
  ],
  controllers: [PlanningUnitsController],
  exports: [PlanningUnitsProcessor, PlanningUnitsService],
})
export class PlanningUnitsModule {}
