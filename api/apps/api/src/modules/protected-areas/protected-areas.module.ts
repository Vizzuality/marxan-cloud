import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProtectedAreasController } from './protected-areas.controller';
import { ProtectedArea } from './protected-area.geo.entity';
import { ProtectedAreasService } from './protected-areas.service';
import { apiConnections } from '../../ormconfig';
import { ProxyService } from '@marxan-api/modules/proxy/proxy.service';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [ProtectedArea],
      apiConnections.geoprocessingDB.name,
    ),
  ],
  providers: [ProtectedAreasService, ProxyService],
  controllers: [ProtectedAreasController],
  exports: [ProtectedAreasService],
})
export class ProtectedAreasModule {}
