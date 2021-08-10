import { Module } from '@nestjs/common';
import { ScenarioSpecificationRepo } from '../scenario-specification.repo';

@Module({
  providers: [
    {
      provide: ScenarioSpecificationRepo,
      useValue: {},
    },
  ],
  exports: [ScenarioSpecificationRepo],
})
export class ScenarioSpecificationAdaptersModule {}
