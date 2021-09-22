import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProtectedAreasController } from './protected-areas.controller';
import { ProtectedArea } from '@marxan/protected-areas';
import { ProtectedAreasService } from './protected-areas.service';
import { ProxyService } from '@marxan-api/modules/proxy/proxy.service';
import { DbConnections } from '@marxan-api/ormconfig.connections';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProtectedArea], DbConnections.geoprocessingDB),
  ],
  providers: [ProtectedAreasService, ProxyService],
  controllers: [ProtectedAreasController],
  exports: [ProtectedAreasService],
})
export class ProtectedAreasModule {}
