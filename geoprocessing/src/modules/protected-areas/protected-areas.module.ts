import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProtectedAreasController } from './protected-areas.controller';
import { ProtectedAreasService } from './protected-areas.service';
import { TileModule } from '../tile/tile.module';
import { ProtectedArea } from './protected-areas.geo.entity';
import { ProjectPaJobModule } from './project-pa-job/project-pa-job.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProtectedArea]),
    TileModule,
    ProjectPaJobModule,
  ],
  providers: [ProtectedAreasService],
  controllers: [ProtectedAreasController],
  exports: [ProtectedAreasService],
})
export class ProtectedAreasModule {}
