import { Module } from '@nestjs/common';
import { ScenarioFeaturesService } from './scenario-features.service';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GeoFeature } from '@marxan-api/modules/geo-features/geo-feature.api.entity';

import { remoteConnectionName } from './entities/remote-connection-name';
import { RemoteScenarioFeaturesData } from './entities/remote-scenario-features-data.geo.entity';
import { RemoteFeaturesData } from './entities/remote-features-data.geo.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([GeoFeature]),
    TypeOrmModule.forFeature(
      [RemoteScenarioFeaturesData, RemoteFeaturesData],
      remoteConnectionName,
    ),
  ],
  providers: [ScenarioFeaturesService],
  exports: [ScenarioFeaturesService],
})
export class ScenarioFeaturesModule {}
