import { Module } from '@nestjs/common';
import { RunWorker } from '../run.worker';
import { sandboxRunnerToken } from '../tokens';

import { runWorkerQueueNameProvider } from './queue-providers';

@Module({
  imports: [],
  providers: [
    RunWorker,
    runWorkerQueueNameProvider,
    {
      provide: sandboxRunnerToken,
      /**
       * useClass and relevant runner
       *
       * BLM-specific runner could most likely be a "wrapper"
       * over coordinating multiple runs -> and thus using
       * MarxanSandboxRunnerService module itself under the hood
       */
      useValue: {},
    },
  ],
  exports: [],
})
export class BlmCalibrationRunModule {}
