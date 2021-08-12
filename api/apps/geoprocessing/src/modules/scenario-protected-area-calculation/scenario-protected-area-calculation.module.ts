import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { WorkerModule } from '@marxan-geoprocessing/modules/worker';

import { ScenarioProtectedAreaCalculationProcessor } from './scenario-protected-area-calculation-processor';
import { ScenarioProtectedAreaCalculationWorker } from './scenario-protected-area-calculation.worker';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScenariosPlanningUnitGeoEntity } from '@marxan/scenarios-planning-unit';

@Module({
  imports: [
    WorkerModule,
    CqrsModule,
    TypeOrmModule.forFeature([ScenariosPlanningUnitGeoEntity]),
  ],
  providers: [
    ScenarioProtectedAreaCalculationProcessor,
    ScenarioProtectedAreaCalculationWorker,
  ],
})
export class ScenarioProtectedAreaCalculationModule {}
