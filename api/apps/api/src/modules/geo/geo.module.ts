import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminArea } from '@marxan/admin-regions';

import { apiConnections } from '../../ormconfig';

@Module({
  imports: [
    TypeOrmModule.forFeature([AdminArea], apiConnections.geoprocessingDB.name),
  ],
})
export class GeoModule {}
