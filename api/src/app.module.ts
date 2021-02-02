import { Module } from '@nestjs/common';
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

@Module({
  imports: [
    TypeOrmModule.forRoot(apiConnections.default),
    TypeOrmModule.forRoot(apiConnections.geoprocessingDB),
    CountriesModule,
    GeoModule,
    ProjectsModule,
    ScenariosModule,
    UsersModule,
    AuthenticationModule,
  ],
  controllers: [AppController, PingController],
  providers: [AppService],
})
export class AppModule {}
