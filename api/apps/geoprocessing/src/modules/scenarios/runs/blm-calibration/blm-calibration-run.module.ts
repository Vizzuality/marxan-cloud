import { Module } from '@nestjs/common';

import { WorkerModule } from '@marxan-geoprocessing/modules/worker';
import {
  MarxanSandboxedRunnerModule,
  SandboxRunner,
} from '@marxan-geoprocessing/marxan-sandboxed-runner';

import { sandboxRunnerToken } from '../tokens';
import { RunWorker } from '../run.worker';

import { runWorkerQueueNameProvider } from './queue-providers';

@Module({
  imports: [WorkerModule, MarxanSandboxedRunnerModule.forCalibration()],
  providers: [
    RunWorker,
    runWorkerQueueNameProvider,
    {
      provide: sandboxRunnerToken,
      useExisting: SandboxRunner,
    },
  ],
  exports: [],
})
export class BlmCalibrationRunModule {}
