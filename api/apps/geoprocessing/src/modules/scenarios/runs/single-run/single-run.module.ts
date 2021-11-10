import { Module } from '@nestjs/common';

import { MarxanSandboxedRunnerModule } from '@marxan-geoprocessing/marxan-sandboxed-runner/marxan-sandboxed-runner.module';
import { MarxanSandboxRunnerService } from '@marxan-geoprocessing/marxan-sandboxed-runner/marxan-sandbox-runner.service';

import { sandboxRunnerToken } from '../tokens';
import { RunWorker } from '../run.worker';

import { runWorkerQueueNameProvider } from './queue.providers';

@Module({
  imports: [MarxanSandboxedRunnerModule],
  providers: [
    RunWorker,
    runWorkerQueueNameProvider,
    {
      provide: sandboxRunnerToken,
      useClass: MarxanSandboxRunnerService,
    },
  ],
  exports: [],
})
export class SingleRunModule {}
