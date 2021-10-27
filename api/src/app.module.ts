import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthenticationModule } from 'modules/authentication/authentication.module';
import { CountriesModule } from 'modules/countries/countries.module';
import { ScenariosModule } from 'modules/scenarios/scenarios.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PingController } from './modules/ping/ping.controller';
import { ProjectsModule } from './modules/projects/projects.module';
import { UsersModule } from './modules/users/users.module';
import { GeoModule } from 'modules/geo/geo.module';
import { apiConnections } from './ormconfig';
import { OrganizationsModule } from 'modules/organizations/organizations.module';
import { FetchSpecificationMiddleware } from 'nestjs-base-service';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from 'filters/all-exceptions.exception.filter';
import { AdminAreasModule } from 'modules/admin-areas/admin-areas.module';
import { ApiEventsModule } from 'modules/api-events/api-events.module';

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
    AdminAreasModule,
    ApiEventsModule,
    CountriesModule,
    GeoModule,
    OrganizationsModule,
    ProjectsModule,
    ScenariosModule,
    UsersModule,
    AuthenticationModule,
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
