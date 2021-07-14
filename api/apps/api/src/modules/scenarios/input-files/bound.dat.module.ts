import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanningUnitsGeom } from '@marxan-jobs/planning-unit-geometry';
import { DbConnections } from '@marxan-api/ormconfig.connections';
import { BoundDatService } from './bound.dat.service';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [PlanningUnitsGeom],
      DbConnections.geoprocessingDB,
    ),
  ],
  providers: [BoundDatService],
  exports: [BoundDatService],
})
export class BoundDatModule {}
