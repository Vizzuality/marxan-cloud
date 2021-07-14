import { Module } from '@nestjs/common';
import { SpecDatService } from './spec.dat.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RemoteScenarioFeaturesData } from '@marxan-api/modules/scenarios-features/entities/remote-scenario-features-data.geo.entity';
import { DbConnections } from '@marxan-api/ormconfig.connections';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [RemoteScenarioFeaturesData],
      DbConnections.geoprocessingDB,
    ),
  ],
  providers: [SpecDatService],
  exports: [SpecDatService],
})
export class SpecDatModule {}
