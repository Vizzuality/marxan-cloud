import { Module } from '@nestjs/common';

import { WorkerModule } from '@marxan-geoprocessing/modules/worker';
import { MarxanSandboxedBlmRunnerModule } from '@marxan-geoprocessing/marxan-sandboxed-runner';
import { RunWorker } from '../run.worker';

import { runWorkerQueueNameProvider } from './queue-providers';

@Module({
  imports: [WorkerModule, MarxanSandboxedBlmRunnerModule],
  providers: [RunWorker, runWorkerQueueNameProvider],
  exports: [],
})
export class BlmCalibrationRunModule {}
