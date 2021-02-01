import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AdminRegion } from './admin-region.geo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AdminRegion], 'geoprocessingDB')],
})
export class GeoModule {}
