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
import { LegacyProjectImportModule } from '../legacy-project-import/legacy-project-import.module';
import { DeleteProjectModule } from './delete-project/delete-project.module';
import { LegacyProjectImportRepositoryModule } from '../legacy-project-import/infra/legacy-project-import.repository.module';
import { ProjectsProxyController } from '@marxan-api/modules/projects/projects-proxy.controller';
import { WebshotModule } from '@marxan/webshot';
import { GeoFeatureTagsModule } from '@marxan-api/modules/geo-feature-tags/geo-feature-tags.module';
import { OutputProjectSummariesModule } from '@marxan-api/modules/projects/output-project-summaries/output-project-summaries.module';
import { AddProtectedAreaModule } from '@marxan-api/modules/projects/protected-area/add-protected-area.module';
import { ProjectProtectedAreasController } from './project-protected-areas.controller';
import { ProjectProtectedAreasService } from './project-protected-areas.service';
import { ProjectAclModule } from '../access-control/projects-acl/project-acl.module';
import { ProtectedAreasCrudModule } from '../protected-areas/protected-areas-crud.module';
import { ProjectCostSurfaceController } from './project-cost-surface.controller';
import { AddProtectedAreaModule } from '@marxan-api/modules/scenarios/protected-area';
import { ProtectedAreaModule } from '@marxan-api/modules/scenarios/protected-area';
import { CostSurfaceModule } from '@marxan-api/modules/cost-surface/cost-surface.module';

@Module({
  imports: [
    CqrsModule,
    AdminAreasModule,
    CountriesModule,
    PlanningAreasModule,
    forwardRef(() => GeoFeaturesModule),
    GeoFeatureTagsModule,
    forwardRef(() => ScenariosModule),
    forwardRef(() => WebshotModule),
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
    ProjectAclModule,
    CloneModule,
    LegacyProjectImportModule,
    AccessControlModule,
    BlockGuardModule,
    ProjectCheckerModule,
    DeleteProjectModule,
    LegacyProjectImportRepositoryModule,
    ApiEventsModule,
    OutputProjectSummariesModule,
    AddProtectedAreaModule,
    ProtectedAreaModule,
    ProtectedAreasCrudModule,
    CostSurfaceModule,
    ProtectedAreaModule
  ],
  providers: [
    ProjectProtectedAreasService,
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
    ProjectProtectedAreasController,
    ProjectsProxyController,
    ProjectCostSurfaceController,
  ],
  // @ToDo Remove TypeOrmModule after project publish will stop use the ProjectRepository
  exports: [ProjectsCrudService, TypeOrmModule, ProjectsService],
})
export class ProjectsModule {}
