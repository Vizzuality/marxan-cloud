import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CountriesController } from './countries.controller';
import { Country } from './country.geo.entity';
import { CountriesService } from './countries.service';
import { DbConnections } from '@marxan-api/ormconfig.connections';

@Module({
  imports: [TypeOrmModule.forFeature([Country], DbConnections.geoprocessingDB)],
  providers: [CountriesService],
  controllers: [CountriesController],
  exports: [CountriesService],
})
export class CountriesModule {}
