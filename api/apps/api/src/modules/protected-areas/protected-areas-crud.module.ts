import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProtectedAreasController } from './protected-areas.controller';
import { ProtectedArea } from '@marxan/protected-areas';
import { ProtectedAreasCrudService } from './protected-areas-crud.service';
import { ProxyService } from '@marxan-api/modules/proxy/proxy.service';
import { DbConnections } from '@marxan-api/ormconfig.connections';
import { Scenario } from '../scenarios/scenario.api.entity';
import { SelectionGetterModule } from '@marxan-api/modules/scenarios/protected-area/getter/selection-getter.module';
import { ProjectAclModule } from '@marxan-api/modules/access-control/projects-acl/project-acl.module';
import { ProjectsModule } from "@marxan-api/modules/projects/projects.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([ProtectedArea], DbConnections.geoprocessingDB),
    TypeOrmModule.forFeature([Scenario]),
    forwardRef(() => SelectionGetterModule),
    forwardRef(() => ProjectsModule),
    ProjectAclModule,
  ],
  providers: [ProtectedAreasCrudService, ProxyService],
  controllers: [ProtectedAreasController],
  exports: [ProtectedAreasCrudService],
})
export class ProtectedAreasCrudModule {}
