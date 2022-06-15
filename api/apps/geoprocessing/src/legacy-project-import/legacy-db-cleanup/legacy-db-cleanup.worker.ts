import {
  FailedLegacyProjectImportDbCleanupJobInput,
  FailedLegacyProjectImportDbCleanupJobOutput,
  failedLegacyProjectImportDbCleanupQueueName,
} from '@marxan/legacy-project-import';
import { Injectable } from '@nestjs/common';
import { Worker } from 'bullmq';
import { WorkerBuilder } from '../../modules/worker';
import { LegacyDbCleanupProcessor } from './legacy-db-cleanup.processor';

@Injectable()
export class LegacyDbCleanupWorker {
  #worker: Worker<
    FailedLegacyProjectImportDbCleanupJobInput,
    FailedLegacyProjectImportDbCleanupJobOutput
  >;

  constructor(
    private readonly wrapper: WorkerBuilder,
    private readonly legacyDbCleanupProcessor: LegacyDbCleanupProcessor,
  ) {
    this.#worker = wrapper.build<
      FailedLegacyProjectImportDbCleanupJobInput,
      FailedLegacyProjectImportDbCleanupJobOutput
    >(failedLegacyProjectImportDbCleanupQueueName, {
      process: (job) => {
        return this.legacyDbCleanupProcessor.run(job.data);
      },
    });
  }
}
