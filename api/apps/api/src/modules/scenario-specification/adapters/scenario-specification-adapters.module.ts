import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Scenario } from '@marxan-api/modules/scenarios/scenario.api.entity';
import { ApiEventsModule } from '@marxan-api/modules/api-events/api-events.module';
import { SpecificationApiEntity } from '@marxan-api/modules/specification/adapters/specification.api.entity';
import { ScenarioSpecificationRepo } from '../application/scenario-specification.repo';
import { DbScenarioSpecificationRepository } from './db-scenario-specification.repository';
import { SpecificationActivatedHandler } from './specification-activated.handler';

@Module({
  imports: [
    TypeOrmModule.forFeature([Scenario, SpecificationApiEntity]),
    ApiEventsModule,
  ],
  providers: [
    {
      provide: ScenarioSpecificationRepo,
      useClass: DbScenarioSpecificationRepository,
    },
    SpecificationActivatedHandler,
  ],
  exports: [ScenarioSpecificationRepo],
})
export class ScenarioSpecificationAdaptersModule {}
