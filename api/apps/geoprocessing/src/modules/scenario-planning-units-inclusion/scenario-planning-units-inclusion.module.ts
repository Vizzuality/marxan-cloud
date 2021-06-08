import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { WorkerModule } from '@marxan-geoprocessing/modules/worker';

import { ScenarioPlanningUnitsInclusionProcessor } from './scenario-planning-units-inclusion-processor';
import { ScenarioPlanningUnitsInclusionWorker } from './scenario-planning-units-inclusion.worker';

@Module({
  imports: [WorkerModule, CqrsModule],
  providers: [
    ScenarioPlanningUnitsInclusionWorker,
    ScenarioPlanningUnitsInclusionProcessor,
  ],
})
export class ScenarioPlanningUnitsInclusionModule {}
