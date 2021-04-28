import { Module } from '@nestjs/common';
import { ScenarioFeaturesService } from './scenario-features.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScenariosFeaturesView } from './entities/scenarios-features.view.api.entity';
import { RemoteScenarioFeaturesData } from './entities/remote-scenario-features-data.geo.entity';
import { remoteConnectionName } from './entities/remote-connection-name';

@Module({
  imports: [
    TypeOrmModule.forFeature([ScenariosFeaturesView]),
    TypeOrmModule.forFeature(
      [RemoteScenarioFeaturesData],
      remoteConnectionName,
    ),
  ],
  providers: [ScenarioFeaturesService],
  exports: [ScenarioFeaturesService],
})
export class ScenarioFeaturesModule {}
