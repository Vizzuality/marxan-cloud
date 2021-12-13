import { Module } from '@nestjs/common';

import { WorkerModule } from '@marxan-geoprocessing/modules/worker';
import { MarxanSandboxedSingleRunnerModule } from '@marxan-geoprocessing/marxan-sandboxed-runner';
import { RunWorker } from '../run.worker';

import { runWorkerQueueNameProvider } from './queue.providers';

@Module({
  imports: [WorkerModule, MarxanSandboxedSingleRunnerModule],
  providers: [RunWorker, runWorkerQueueNameProvider],
  exports: [],
})
export class SingleRunModule {}
