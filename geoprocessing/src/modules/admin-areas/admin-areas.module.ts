import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AdminAreasController } from './admin-areas.controller';
import { AdminAreasService } from './admin-areas.service';
import { TileModule } from 'src/modules/tile/tile.module';
import { AdminArea } from './admin-areas.geo.entity'

@Module({
  imports: [TileModule, TypeOrmModule.forFeature([AdminArea])],
  providers: [AdminAreasService],
  controllers: [AdminAreasController],
})
export class AdminAreasModule {}
