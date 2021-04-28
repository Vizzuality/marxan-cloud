import { Module } from '@nestjs/common';
import { ScenarioFeatureFacade } from './scenario-feature.facade';

@Module({
  providers: [ScenarioFeatureFacade],
  exports: [ScenarioFeatureFacade],
})
export class ScenarioFeaturesModule {}
