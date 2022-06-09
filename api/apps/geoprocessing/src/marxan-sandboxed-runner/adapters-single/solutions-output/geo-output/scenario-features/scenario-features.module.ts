import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScenarioFeaturesData } from '@marxan/features';
import { OutputScenariosFeaturesDataGeoEntity } from '@marxan/marxan-output';

import { ScenarioFeatureIdMapper } from './id-mapper/scenario-feature-id.mapper';
import { ScenarioFeaturesDataService } from './scenario-features-data.service';
import { MvFileReader } from './file-reader/mv-file-reader';
import { LegacyProjectImportScenarioFeatureIdMapper } from './id-mapper/legacy-project-import-scenario-feature-id.mapper';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ScenarioFeaturesData,
      OutputScenariosFeaturesDataGeoEntity,
    ]),
  ],
  providers: [
    ScenarioFeatureIdMapper,
    LegacyProjectImportScenarioFeatureIdMapper,
    ScenarioFeaturesDataService,
    MvFileReader,
  ],
  exports: [ScenarioFeaturesDataService],
})
export class ScenarioFeaturesModule {}
