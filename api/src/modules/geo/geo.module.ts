import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AdminArea } from 'modules/admin-areas/admin-area.geo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AdminArea], 'geoprocessingDB')],
})
export class GeoModule {}
