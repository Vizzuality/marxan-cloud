import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ScenariosController } from './scenarios.controller';
import { ScenariosService } from './scenarios.service';
import { TileModule } from '@marxan-geoprocessing/modules/tile/tile.module';
import { WorkerModule } from '@marxan-geoprocessing/modules/worker';
import { ScenariosPuPaDataGeo } from '@marxan/scenarios-planning-unit';
import { PlanningUnitsGeom } from '@marxan-jobs/planning-unit-geometry';

import { BlmCalibrationRunModule } from './runs/blm-calibration/blm-calibration-run.module';
import { SingleRunModule } from './runs/single-run/single-run.module';
import { ScenarioComparisonTilesService } from './comparison-difference-tile/comparison-difference-tile.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ScenariosPuPaDataGeo, PlanningUnitsGeom]),
    TileModule,
    BlmCalibrationRunModule,
    SingleRunModule,
    WorkerModule,
  ],
  providers: [ScenariosService, ScenarioComparisonTilesService],
  controllers: [ScenariosController],
  exports: [ScenariosService, TypeOrmModule],
})
export class ScenariosModule {}
