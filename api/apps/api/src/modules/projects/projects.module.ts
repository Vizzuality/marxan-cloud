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
import { PlanningAreasModule } from './planning-areas';
import { UsersProjectsApiEntity } from './control-level/users-projects.api.entity';
import { ProjectsListingController } from './projects-listing.controller';
import { ProjectDetailsController } from './project-details.controller';
import { ShapefilesModule } from '@marxan/shapefile-converter';
import { PlanningUnitGridModule } from './planning-unit-grid';
import { ProtectedArea } from '@marxan/protected-areas';
import { apiConnections } from '@marxan-api/ormconfig';
import { CqrsModule } from '@nestjs/cqrs';
import { GetProjectHandler } from './get-project.handler';

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
      UsersProjectsApiEntity,
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
  ],
  providers: [
    ProjectsCrudService,
    ProjectsService,
    GeoFeatureSerializer,
    ProjectSerializer,
    JobStatusService,
    JobStatusSerializer,
    GetProjectHandler,
  ],
  /**
   * Order is important due to `GET projects/published` clash with
   * `GET projects/:id`
   */
  controllers: [
    ProjectsListingController,
    ProjectDetailsController,
    ProjectsController,
  ],
  exports: [ProjectsCrudService],
})
export class ProjectsModule {}
