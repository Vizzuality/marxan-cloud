import { ApiEventsModule } from '@marxan-api/modules/api-events';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Scenario } from '../scenario.api.entity';
import { MarxanScenarioChecker } from './marxan-scenario-checker.service';
import { ScenarioChecker } from './scenario-checker.service';

@Module({
  imports: [ApiEventsModule, TypeOrmModule.forFeature([Scenario])],
  providers: [
    {
      useClass: MarxanScenarioChecker,
      provide: ScenarioChecker,
    },
  ],
  exports: [ScenarioChecker],
})
export class ScenarioCheckerModule {}
