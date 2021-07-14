import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ScenariosController } from './scenarios.controller';
import { ScenariosService } from './scenarios.service';
import { TileModule } from '@marxan-geoprocessing/modules/tile/tile.module';
import { ScenariosPuPaDataGeo } from '@marxan/scenarios-planning-unit';
import { PlanningUnitsGeom } from '@marxan-jobs/planning-unit-geometry';

@Module({
  imports: [
    TypeOrmModule.forFeature([ScenariosPuPaDataGeo, PlanningUnitsGeom]),
    TileModule,
  ],
  providers: [ScenariosService],
  controllers: [ScenariosController],
  exports: [ScenariosService, TypeOrmModule],
})
export class ScenariosModule {}
