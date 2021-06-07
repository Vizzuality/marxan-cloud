import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AdminArea } from '@marxan/admin-regions';
import { AdminAreasController } from './admin-areas.controller';
import { AdminAreasService } from './admin-areas.service';
import { apiConnections } from '../../ormconfig';
import { ProxyService } from '@marxan-api/modules/proxy/proxy.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AdminArea], apiConnections.geoprocessingDB.name),

  ],
  providers: [AdminAreasService, ProxyService],
  controllers: [AdminAreasController],
  exports: [AdminAreasService],
})
export class AdminAreasModule {}
