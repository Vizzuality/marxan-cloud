import { Module } from '@nestjs/common';
import { WorkerModule } from '@marxan-geoprocessing/modules/worker';
import { ShapefilesModule } from '@marxan/shapefile-converter';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PlanningUnitsGridProcessor } from './planning-units-grid.processor';
import { GridGeoJsonValidator } from './grid-geojson-validator';

@Module({
  imports: [WorkerModule, ShapefilesModule, TypeOrmModule.forFeature([])],
  providers: [PlanningUnitsGridProcessor, GridGeoJsonValidator],
})
export class PlanningUnitsGridModule {}
