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
import { ProtectedAreasModule } from './protected-areas/protected-areas.module';
import { ProjectsService } from './projects.service';
import { GeoFeatureSerializer } from './dto/geo-feature.serializer';
import { ProjectSerializer } from './dto/project.serializer';
import { JobStatusSerializer } from './dto/job-status.serializer';
import { BboxResolver } from './bbox/bbox-resolver';
import { JobStatusService } from './job-status/job-status.service';

@Module({
  imports: [
    AdminAreasModule,
    CountriesModule,
    GeoFeaturesModule,
    forwardRef(() => ScenariosModule),
    TypeOrmModule.forFeature([Project]),
    UsersModule,
    PlanningUnitsModule,
    ProtectedAreasModule,
    ApiEventsModule,
  ],
  providers: [
    ProjectsCrudService,
    ProjectsService,
    GeoFeatureSerializer,
    ProjectSerializer,
    BboxResolver,
    JobStatusService,
    JobStatusSerializer,
  ],
  controllers: [ProjectsController],
  exports: [ProjectsCrudService],
})
export class ProjectsModule {}
