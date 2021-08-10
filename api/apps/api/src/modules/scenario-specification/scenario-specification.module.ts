import { Module } from '@nestjs/common';

import { ScenarioSpecificationApplicationModule } from './application/scenario-specification-application.module';
import { ScenarioSpecificationAdaptersModule } from './application/adapters/scenario-specification-adapters.module';

@Module({
  imports: [
    ScenarioSpecificationApplicationModule.for([
      ScenarioSpecificationAdaptersModule,
    ]),
  ],
  exports: [
    ScenarioSpecificationApplicationModule.for([
      ScenarioSpecificationAdaptersModule,
    ]),
  ],
})
export class ScenarioSpecificationModule {}
