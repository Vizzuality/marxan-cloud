import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScenarioFeaturesData } from '@marxan/features';
import { OutputScenariosFeaturesDataGeoEntity } from '@marxan/marxan-output';

import { ScenarioFeatureIdMapper } from './id-mapper/scenario-feature-id.mapper';
import { ScenarioFeaturesDataService } from './scenario-features-data.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ScenarioFeaturesData,
      OutputScenariosFeaturesDataGeoEntity,
    ]),
  ],
  providers: [ScenarioFeatureIdMapper, ScenarioFeaturesDataService],
  exports: [ScenarioFeaturesDataService],
})
export class ScenarioFeaturesModule {}
