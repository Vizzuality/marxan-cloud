import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProjectsController } from './projects.controller';
import { Project } from './project.api.entity';
import { ProjectsService } from './projects.service';
import { UsersModule } from 'modules/users/users.module';
import { ScenariosModule } from 'modules/scenarios/scenarios.module';
import { AdminAreasModule } from 'modules/admin-areas/admin-areas.module';
import { CountriesModule } from 'modules/countries/countries.module';
import { PlanningUnitsModule } from 'modules/planning-units/planning-units.module';
import { GeoFeaturesModule } from 'modules/geo-features/geo-features.module';

@Module({
  imports: [
    AdminAreasModule,
    CountriesModule,
    GeoFeaturesModule,
    forwardRef(() => ScenariosModule),
    TypeOrmModule.forFeature([Project]),
    UsersModule,
    PlanningUnitsModule,
  ],
  providers: [ProjectsService],
  controllers: [ProjectsController],
  exports: [ProjectsService],
})
export class ProjectsModule {}
