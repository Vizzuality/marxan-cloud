import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ScenarioPuvsprGeoEntity } from '@marxan/scenario-puvspr';

import { DbConnections } from '@marxan-api/ormconfig.connections';

import { PuvsprDatService } from './puvspr.dat.service';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [ScenarioPuvsprGeoEntity],
      DbConnections.geoprocessingDB,
    ),
  ],
  providers: [PuvsprDatService],
  exports: [PuvsprDatService],
})
export class PuvsprDatModule {}
