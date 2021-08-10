import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Scenario } from '@marxan-api/modules/scenarios/scenario.api.entity';
import { ScenarioSpecificationRepo } from '../application/scenario-specification.repo';
import { DbScenarioSpecificationRepository } from './db-scenario-specification.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Scenario])],
  providers: [
    {
      provide: ScenarioSpecificationRepo,
      useClass: DbScenarioSpecificationRepository,
    },
  ],
  exports: [ScenarioSpecificationRepo],
})
export class ScenarioSpecificationAdaptersModule {}
