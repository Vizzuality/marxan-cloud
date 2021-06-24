import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { WorkerModule } from '@marxan-geoprocessing/modules/worker';

import { ScenarioPlanningUnitsInclusionProcessor } from './scenario-planning-units-inclusion-processor';
import { ScenarioPlanningUnitsInclusionWorker } from './scenario-planning-units-inclusion.worker';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScenariosPlanningUnitGeoEntity } from '@marxan/scenarios-planning-unit';

@Module({
  imports: [
    WorkerModule,
    CqrsModule,
    TypeOrmModule.forFeature([ScenariosPlanningUnitGeoEntity]),
  ],
  providers: [
    ScenarioPlanningUnitsInclusionWorker,
    ScenarioPlanningUnitsInclusionProcessor,
  ],
})
export class ScenarioPlanningUnitsInclusionModule {}
