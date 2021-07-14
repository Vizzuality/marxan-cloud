import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ScenariosController } from './scenarios.controller';
import { ScenariosService } from './scenarios.service';
import { TileModule } from '@marxan-geoprocessing/modules/tile/tile.module';
import { WorkerModule } from '@marxan-geoprocessing/modules/worker';
import { MarxanSandboxedRunnerModule } from '@marxan-geoprocessing/marxan-sandboxed-runner/marxan-sandboxed-runner.module';
import { ScenariosPuPaDataGeo } from '@marxan/scenarios-planning-unit';
import { PlanningUnitsGeom } from '@marxan-jobs/planning-unit-geometry';
import { RunWorker, runWorkerQueueNameProvider } from './run.worker';

@Module({
  imports: [
    TypeOrmModule.forFeature([ScenariosPuPaDataGeo, PlanningUnitsGeom]),
    TileModule,
    MarxanSandboxedRunnerModule,
    WorkerModule,
  ],
  providers: [ScenariosService, runWorkerQueueNameProvider, RunWorker],
  controllers: [ScenariosController],
  exports: [ScenariosService, TypeOrmModule],
})
export class ScenariosModule {}
