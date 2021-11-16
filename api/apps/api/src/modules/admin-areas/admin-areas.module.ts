import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AdminArea } from '@marxan/admin-regions';
import { AdminAreasController } from './admin-areas.controller';
import { AdminAreasService } from './admin-areas.service';
import { ProxyService } from '@marxan-api/modules/proxy/proxy.service';
import { DbConnections } from '@marxan-api/ormconfig.connections';

@Module({
  imports: [
    TypeOrmModule.forFeature([AdminArea], DbConnections.geoprocessingDB),
  ],
  providers: [AdminAreasService, ProxyService],
  controllers: [AdminAreasController],
  exports: [AdminAreasService],
})
export class AdminAreasModule {}
