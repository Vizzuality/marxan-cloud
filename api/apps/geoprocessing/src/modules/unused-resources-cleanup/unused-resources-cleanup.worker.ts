import { failedImportDbCleanupQueueName } from '@marxan/cloning';
import {
  UnusedResourcesCleanupJobInput,
  UnusedResourcesCleanupJobOutput,
  unusedResourcesCleanupQueueName,
} from '@marxan/unused-resources-cleanup';
import { Injectable } from '@nestjs/common';
import { Worker } from 'bullmq';
import { WorkerBuilder } from '../worker';
import { UnusedResourcesCleanupProcessor } from './unused-resources-cleanup.processor';

@Injectable()
export class UnusedResourcesCleanupWorker {
  #worker: Worker<
    UnusedResourcesCleanupJobInput,
    UnusedResourcesCleanupJobOutput
  >;

  constructor(
    private readonly wrapper: WorkerBuilder,
    private readonly unusedResourcesCleanupProcessor: UnusedResourcesCleanupProcessor,
  ) {
    this.#worker = wrapper.build<
      UnusedResourcesCleanupJobInput,
      UnusedResourcesCleanupJobOutput
    >(unusedResourcesCleanupQueueName, {
      process: (job) => {
        return this.unusedResourcesCleanupProcessor.run(job.data);
      },
    });
  }
}
