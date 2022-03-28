import { failedImportDbCleanupQueueName } from '@marxan/cloning';
import { FailedImportDbCleanupJobInput } from '@marxan/cloning/job-input';
import { FailedImportDbCleanupJobOutput } from '@marxan/cloning/job-output';
import { Injectable } from '@nestjs/common';
import { Worker } from 'bullmq';
import { WorkerBuilder } from '../../modules/worker';
import { DbCleanupProcessor } from './db-cleanup.processor';

@Injectable()
export class DbCleanupWorker {
  #worker: Worker<
    FailedImportDbCleanupJobInput,
    FailedImportDbCleanupJobOutput
  >;

  constructor(
    private readonly wrapper: WorkerBuilder,
    private readonly dbCleanupProcessor: DbCleanupProcessor,
  ) {
    this.#worker = wrapper.build<
      FailedImportDbCleanupJobInput,
      FailedImportDbCleanupJobOutput
    >(failedImportDbCleanupQueueName, {
      process: (job) => {
        return this.dbCleanupProcessor.run(job.data);
      },
    });
  }
}
