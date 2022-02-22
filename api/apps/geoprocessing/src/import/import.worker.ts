import {
  ImportJobInput,
  ImportJobOutput,
  importPieceQueueName,
} from '@marxan/cloning';
import { Injectable } from '@nestjs/common';
import { Worker } from 'bullmq';
import { WorkerBuilder } from '../modules/worker';
import { ImportProcessor } from './import.processor';

@Injectable()
export class ImportWorker {
  #worker: Worker<ImportJobInput, ImportJobOutput>;

  constructor(
    private readonly wrapper: WorkerBuilder,
    private readonly importProcessor: ImportProcessor,
  ) {
    this.#worker = wrapper.build<ImportJobInput, ImportJobOutput>(
      importPieceQueueName,
      {
        process: (job) => {
          return this.importProcessor.run(job.data);
        },
      },
    );
  }
}
