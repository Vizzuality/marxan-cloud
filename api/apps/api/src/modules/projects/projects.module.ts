import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProjectsController } from './projects.controller';
import { Project } from './project.api.entity';
import { ProjectsCrudService } from './projects-crud.service';
import { UsersModule } from '@marxan-api/modules/users/users.module';
import { ScenariosModule } from '@marxan-api/modules/scenarios/scenarios.module';
import { AdminAreasModule } from '@marxan-api/modules/admin-areas/admin-areas.module';
import { CountriesModule } from '@marxan-api/modules/countries/countries.module';
import { PlanningUnitsModule } from '@marxan-api/modules/planning-units/planning-units.module';
import { GeoFeaturesModule } from '@marxan-api/modules/geo-features/geo-features.module';
import { ApiEventsModule } from '@marxan-api/modules/api-events/api-events.module';
import { ProjectsService } from './projects.service';
import { GeoFeatureSerializer } from './dto/geo-feature.serializer';
import { ProjectSerializer } from './dto/project.serializer';
import { JobStatusSerializer } from './dto/job-status.serializer';
import { JobStatusService } from './job-status/job-status.service';
import { ScenarioJobStatus } from './job-status/job-status.view.api.entity';
import { ProjectJobStatus } from './job-status/project-status.view.api.entity';
import { PlanningAreasModule } from '@marxan-api/modules/planning-areas';
import { UsersProjectsApiEntity } from '@marxan-api/modules/access-control/projects-acl/entity/users-projects.api.entity';
import { ProjectsListingController } from './projects-listing.controller';
import { ProjectDetailsController } from './project-details.controller';
import { ShapefilesModule } from '@marxan/shapefile-converter';
import { PlanningUnitGridModule } from './planning-unit-grid';
import { ProtectedArea } from '@marxan/protected-areas';
import { apiConnections } from '@marxan-api/ormconfig';
import { CqrsModule } from '@nestjs/cqrs';
import { GetProjectHandler } from './get-project.handler';
import { ProjectBlmModule } from './blm';
import { CloneModule } from '@marxan-api/modules/clone';
import { AccessControlModule } from '../access-control';
import { BlockGuardModule } from '@marxan-api/modules/projects/block-guard/block-guard.module';
import { ProjectCheckerModule } from '@marxan-api/modules/projects/project-checker/project-checker.module';
import { PublishedProject } from '@marxan-api/modules/published-project/entities/published-project.api.entity';
import { ProxyService } from '@marxan-api/modules/proxy/proxy.service';
import { ExportEntity } from '../clone/export/adapters/entities/exports.api.entity';
import { ExportComponentEntity } from '../clone/export/adapters/entities/export-components.api.entity';
import { ExportComponentLocationEntity } from '../clone/export/adapters/entities/export-component-locations.api.entity';
import { ExportRepository } from '../clone/export/application/export-repository.port';
import { TypeormExportRepository } from '../clone/export/adapters/typeorm-export.repository';

@Module({
  imports: [
    CqrsModule,
    AdminAreasModule,
    CountriesModule,
    PlanningAreasModule,
    GeoFeaturesModule,
    forwardRef(() => ScenariosModule),
    TypeOrmModule.forFeature([
      Project,
      ScenarioJobStatus,
      ProjectJobStatus,
      PublishedProject,
      UsersProjectsApiEntity,
      ExportEntity,
      ExportComponentEntity,
      ExportComponentLocationEntity,
    ]),
    TypeOrmModule.forFeature(
      [ProtectedArea],
      apiConnections.geoprocessingDB.name,
    ),
    UsersModule,
    PlanningUnitsModule,
    ApiEventsModule,
    ShapefilesModule,
    PlanningUnitGridModule,
    ProjectBlmModule,
    CloneModule,
    AccessControlModule,
    BlockGuardModule,
    ProjectCheckerModule,
  ],
  providers: [
    ProjectsCrudService,
    ProjectsService,
    GeoFeatureSerializer,
    ProjectSerializer,
    JobStatusService,
    JobStatusSerializer,
    GetProjectHandler,
    ProxyService,
    {
      provide: ExportRepository,
      useClass: TypeormExportRepository,
    },
  ],
  controllers: [
    ProjectsListingController,
    ProjectDetailsController,
    ProjectsController,
  ],
  // @ToDo Remove TypeOrmModule after project publish will stop use the ProjectRepository
  exports: [ProjectsCrudService, TypeOrmModule, ProjectsService],
})
export class ProjectsModule {}
