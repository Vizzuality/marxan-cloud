import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';

import { ProtectedAreasController } from './protected-areas.controller';
import { ProtectedAreasService } from './protected-areas.service';
import { TileModule } from '@marxan-geoprocessing/modules/tile/tile.module';
import { ProtectedArea } from '@marxan-geoprocessing/modules/protected-areas/protected-areas.geo.entity';
import { ProtectedAreaWorkerModule } from './worker/protected-area-worker.module';
import { ProtectedAreasGcModule } from './gc';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProtectedArea]),
    TileModule,
    ProtectedAreaWorkerModule,
    CqrsModule,
    ProtectedAreasGcModule,
  ],
  providers: [ProtectedAreasService],
  controllers: [ProtectedAreasController],
  exports: [ProtectedAreasService, TypeOrmModule],
})
export class ProtectedAreasModule {}
