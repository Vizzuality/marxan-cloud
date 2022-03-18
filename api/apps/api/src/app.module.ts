import {
  ConsoleLogger,
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
import { ProcessFetchSpecification } from 'nestjs-base-service';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from '@marxan-api/filters/all-exceptions.exception.filter';
import { AdminAreasModule } from '@marxan-api/modules/admin-areas/admin-areas.module';
import { ApiEventsModule } from '@marxan-api/modules/api-events/api-events.module';
import { ProtectedAreasCrudModule } from '@marxan-api/modules/protected-areas/protected-areas-crud.module';
import { ProxyModule } from '@marxan-api/modules/proxy/proxy.module';
import { ScenariosPlanningUnitModule } from './modules/scenarios-planning-unit/scenarios-planning-unit.module';
import { PlanningUnitsProtectionLevelModule } from '@marxan-api/modules/planning-units-protection-level';
import { AnalysisModule } from '@marxan-api/modules/analysis/analysis.module';
import { PlanningUnitsModule } from '@marxan-api/modules/planning-units/planning-units.module';
import { SpecificationModule } from '@marxan-api/modules/specification';
import { ScenarioSpecificationModule } from './modules/scenario-specification';
import { PublishedProjectModule } from '@marxan-api/modules/published-project/published-project.module';
import { BlmValuesModule } from '@marxan-api/modules/blm';
import { AccessControlModule } from '@marxan-api/modules/access-control';
import { FileRepositoryModule } from '@marxan/files-repository';
import { CloneModule } from './modules/clone';
import { WebshotModule } from './modules/webshot/webshot.module';

@Module({
  imports: [
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
    ProtectedAreasCrudModule,
    ScenariosModule,
    UsersModule,
    AuthenticationModule,
    ProxyModule,
    ScenariosPlanningUnitModule,
    PlanningUnitsProtectionLevelModule,
    AnalysisModule,
    PlanningUnitsModule,
    SpecificationModule,
    ScenarioSpecificationModule,
    PublishedProjectModule,
    BlmValuesModule,
    AccessControlModule,
    FileRepositoryModule,
    CloneModule,
    WebshotModule,
  ],
  controllers: [AppController, PingController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    ConsoleLogger,
  ],
})
export class AppModule implements NestModule {
  /**
   * @todo Apply middleware more surgically; probably rename it to something
   * more generic (e.g. `ProcessFetchSpecification`?).
   */
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ProcessFetchSpecification)
      .forRoutes({ path: '*', method: RequestMethod.GET });
  }
}
