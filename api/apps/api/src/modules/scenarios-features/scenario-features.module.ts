import { Module } from '@nestjs/common';
import { ScenarioFeaturesService } from './scenario-features.service';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GeoFeature } from '@marxan-api/modules/geo-features/geo-feature.api.entity';

import { ScenarioFeaturesData } from '@marxan/features';
import { RemoteFeaturesData } from './entities/remote-features-data.geo.entity';
import { DbConnections } from '@marxan-api/ormconfig.connections';

@Module({
  imports: [
    TypeOrmModule.forFeature([GeoFeature]),
    TypeOrmModule.forFeature(
      [ScenarioFeaturesData, RemoteFeaturesData],
      DbConnections.geoprocessingDB,
    ),
  ],
  providers: [ScenarioFeaturesService],
  exports: [ScenarioFeaturesService],
})
export class ScenarioFeaturesModule {}
