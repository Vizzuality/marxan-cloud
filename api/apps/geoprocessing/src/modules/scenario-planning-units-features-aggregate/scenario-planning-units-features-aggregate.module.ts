import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkerModule } from '@marxan-geoprocessing/modules/worker';

import { ScenarioPlanningUnitsFeaturesAggregateWorker } from './scenario-planning-units-features-aggregate.worker';
import { ScenarioPlanningUnitsFeaturesAggregateProcessor } from './scenario-planning-units-features-aggregate-processor';

@Module({
  imports: [WorkerModule, TypeOrmModule.forFeature([])],
  providers: [
    ScenarioPlanningUnitsFeaturesAggregateWorker,
    ScenarioPlanningUnitsFeaturesAggregateProcessor,
  ],
})
export class ScenarioPlanningUnitsFeaturesAggregateModule {}
