import { Module } from '@nestjs/common';
import { ScenarioFeatureFacade } from './scenario-feature.facade';
import { ScenariosFeaturesApplicationModule } from './application';
import { ScenariosFeaturesAdaptersModule } from './infra';

@Module({
  imports: [
    ScenariosFeaturesApplicationModule.for([ScenariosFeaturesAdaptersModule]),
  ],
  providers: [ScenarioFeatureFacade],
  exports: [ScenarioFeatureFacade],
})
export class ScenarioFeaturesModule {}
