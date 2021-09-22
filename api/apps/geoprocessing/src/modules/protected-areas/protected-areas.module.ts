import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';

import { ProtectedAreasController } from './protected-areas.controller';
import { TileModule } from '@marxan-geoprocessing/modules/tile/tile.module';
import { ProtectedArea } from '@marxan/protected-areas';
import { ProtectedAreaWorkerModule } from './worker/protected-area-worker.module';
import { ProtectedAreasTilesService } from './protected-areas-tiles.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProtectedArea]),
    TileModule,
    ProtectedAreaWorkerModule,
    CqrsModule,
  ],
  providers: [ProtectedAreasTilesService],
  controllers: [ProtectedAreasController],
  exports: [],
})
export class ProtectedAreasModule {}
