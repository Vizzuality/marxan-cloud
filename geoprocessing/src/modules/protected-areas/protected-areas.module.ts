import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProtectedAreasController } from './protected-areas.controller';
import { ProtectedAreasService } from './protected-areas.service';
import { TileModule } from 'src/modules/tile/tile.module';
import { ProtectedArea } from 'src/modules/protected-areas/protected-areas.geo.entity';
import { ProtectedAreaWorkerModule } from './worker/protected-area-worker.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProtectedArea]),
    TileModule,
    ProtectedAreaWorkerModule,
  ],
  providers: [ProtectedAreasService],
  controllers: [ProtectedAreasController],
  exports: [ProtectedAreasService],
})
export class ProtectedAreasModule {}
