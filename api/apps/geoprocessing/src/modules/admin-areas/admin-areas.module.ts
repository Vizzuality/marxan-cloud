import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AdminAreasController } from './admin-areas.controller';
import { AdminAreasService } from './admin-areas.service';
import { TileModule } from 'src/modules/tile/tile.module';
import { AdminArea } from 'src/modules/admin-areas/admin-areas.geo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AdminArea]), TileModule],
  providers: [AdminAreasService],
  controllers: [AdminAreasController],
  exports: [AdminAreasService],
})
export class AdminAreasModule {}
