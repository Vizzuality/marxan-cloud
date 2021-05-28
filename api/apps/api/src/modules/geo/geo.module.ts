import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AdminArea } from 'modules/admin-areas/admin-area.geo.entity';
import { apiConnections } from '../../ormconfig';

@Module({
  imports: [
    TypeOrmModule.forFeature([AdminArea], apiConnections.geoprocessingDB.name),
  ],
})
export class GeoModule {}
