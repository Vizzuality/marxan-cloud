import { Injectable } from '@nestjs/common';
import { Worker } from 'bullmq';
import {
  LegacyProjectImportJobInput,
  LegacyProjectImportJobOutput,
  legacyProjectImportQueueName,
} from '@marxan/legacy-project-import';
import { WorkerBuilder } from '../modules/worker';
import { LegacyProjectImportProcessor } from './legacy-project-import.processor';

@Injectable()
export class LegacyProjectImportWorker {
  #worker: Worker<LegacyProjectImportJobInput, LegacyProjectImportJobOutput>;

  constructor(
    private readonly wrapper: WorkerBuilder,
    private readonly legacyProjectImportProcessor: LegacyProjectImportProcessor,
  ) {
    this.#worker = wrapper.build<
      LegacyProjectImportJobInput,
      LegacyProjectImportJobOutput
    >(legacyProjectImportQueueName, {
      process: (job) => {
        return this.legacyProjectImportProcessor.run(job.data);
      },
    });
  }
}
