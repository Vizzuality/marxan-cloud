import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProtectedAreasController } from './protected-areas.controller';
import { ProtectedArea } from '@marxan/protected-areas';
import { ProtectedAreasCrudService } from './protected-areas-crud.service';
import { ProxyService } from '@marxan-api/modules/proxy/proxy.service';
import { DbConnections } from '@marxan-api/ormconfig.connections';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProtectedArea], DbConnections.geoprocessingDB),
  ],
  providers: [ProtectedAreasCrudService, ProxyService],
  controllers: [ProtectedAreasController],
  exports: [ProtectedAreasCrudService],
})
export class ProtectedAreasCrudModule {}
