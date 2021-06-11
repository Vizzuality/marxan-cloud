import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthenticationModule } from '@marxan-api/modules/authentication/authentication.module';
import { CountriesModule } from '@marxan-api/modules/countries/countries.module';
import { ScenariosModule } from '@marxan-api/modules/scenarios/scenarios.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PingController } from './modules/ping/ping.controller';
import { ProjectsModule } from './modules/projects/projects.module';
import { UsersModule } from './modules/users/users.module';
import { GeoModule } from '@marxan-api/modules/geo/geo.module';
import { GeoFeaturesModule } from '@marxan-api/modules/geo-features/geo-features.module';
import { apiConnections } from './ormconfig';
import { OrganizationsModule } from '@marxan-api/modules/organizations/organizations.module';
import { FetchSpecificationMiddleware } from 'nestjs-base-service';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from '@marxan-api/filters/all-exceptions.exception.filter';
import { AdminAreasModule } from '@marxan-api/modules/admin-areas/admin-areas.module';
import { ApiEventsModule } from '@marxan-api/modules/api-events/api-events.module';
import { ProtectedAreasModule } from '@marxan-api/modules/protected-areas/protected-areas.module';
import { ProxyModule } from '@marxan-api/modules/proxy/proxy.module';
import { ScenariosPlanningUnitModule } from './modules/scenarios-planning-unit/scenarios-planning-unit.module';
import { PlanningUnitsProtectionLevelModule } from '@marxan-api/modules/planning-units-protection-level';
import { AnalysisModule } from '@marxan-api/modules/analysis/analysis.module';
import { PlanningUnitsModule } from '@marxan-api/modules/planning-units/planning-units.module';
import { ScenarioCostSurfaceModule } from '@marxan/scenario-cost-surface';

@Module({
  imports: [
    ScenarioCostSurfaceModule.for(apiConnections.default.name),
    TypeOrmModule.forRoot({
      ...apiConnections.default,
      keepConnectionAlive: true,
    }),
    TypeOrmModule.forRoot({
      ...apiConnections.geoprocessingDB,
      keepConnectionAlive: true,
    }),
    CqrsModule,
    AdminAreasModule,
    ApiEventsModule,
    CountriesModule,
    GeoModule,
    GeoFeaturesModule,
    OrganizationsModule,
    ProjectsModule,
    ProtectedAreasModule,
    ScenariosModule,
    UsersModule,
    AuthenticationModule,
    ProxyModule,
    ScenariosPlanningUnitModule,
    PlanningUnitsProtectionLevelModule,
    AnalysisModule,
    PlanningUnitsModule,
  ],
  controllers: [AppController, PingController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule implements NestModule {
  /**
   * @todo Apply middleware more surgically; probably rename it to something
   * more generic (e.g. `FetchSpecificationMiddleware`?).
   */
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(FetchSpecificationMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.GET });
  }
}
