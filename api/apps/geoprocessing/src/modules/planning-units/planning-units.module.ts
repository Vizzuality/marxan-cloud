import { Logger, Module } from '@nestjs/common';
import { TileModule } from '@marxan-geoprocessing/modules/tile/tile.module';
import { PlanningUnitsProcessor } from './planning-units.worker';
import { PlanningUnitsController } from './planning-units.controller';
import { ShapefileService, FileService } from '@marxan/shapefile-converter';
import { PlanningUnitsService } from './planning-units.service';
import { WorkerModule } from '../worker';
import { PlanningUnitsJobProcessor } from './planning-units.job';
import { ProjectCostSurfaceModule } from '@marxan-geoprocessing/modules/cost-surface/project/project-cost-surface.module';

@Module({
  imports: [TileModule, WorkerModule, ProjectCostSurfaceModule],
  providers: [
    PlanningUnitsProcessor,
    ShapefileService,
    FileService,
    PlanningUnitsService,
    PlanningUnitsJobProcessor,
    Logger,
  ],
  controllers: [PlanningUnitsController],
  exports: [PlanningUnitsProcessor, PlanningUnitsService],
})
export class PlanningUnitsModule {}
