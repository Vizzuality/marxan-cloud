import { HttpModule, Module } from '@nestjs/common';
import { PlanningAreaRepositoryModule } from '@marxan/planning-area-repository';
import { CountriesModule } from '@marxan-api/modules/countries/countries.module';
import { AdminAreasModule } from '@marxan-api/modules/admin-areas/admin-areas.module';
import { PlanningAreasService } from './planning-areas.service';
import {
  geoprocessingUrlProvider,
  CustomPlanningAreasUploader,
} from './custom-planning-areas-uploader.service';
import { AdminPlanningAreasService } from './admin-planning-areas.service';
import { CountryPlanningAreasService } from './country-planning-areas.service';
import { CustomPlanningAreasService } from './custom-planning-areas.service';
import { AdminPlanningAreasRepository } from './admin-planning-areas.repository';
import { AllPlanningAreasService } from './all-planning-areas.service';
import { DbConnections } from '@marxan-api/ormconfig.connections';

@Module({
  imports: [
    HttpModule,
    PlanningAreaRepositoryModule.for(DbConnections.geoprocessingDB),
    AdminAreasModule,
    CountriesModule,
  ],
  providers: [
    AdminPlanningAreasRepository,
    geoprocessingUrlProvider,
    CustomPlanningAreasUploader,
    PlanningAreasService,
    AdminPlanningAreasService,
    CountryPlanningAreasService,
    CustomPlanningAreasService,
    AllPlanningAreasService,
  ],
  exports: [PlanningAreasService],
})
export class PlanningAreasModule {}
