import { Injectable } from '@nestjs/common';
import { Worker } from 'bullmq';

import {
  exportPieceQueueName,
  ExportJobInput,
  ExportJobOutput,
} from '@marxan/cloning';
import { WorkerBuilder } from '@marxan-geoprocessing/modules/worker';

import { ExportProcessor } from './export.processor';

@Injectable()
export class ExportWorker {
  #worker: Worker<ExportJobInput, ExportJobOutput>;

  constructor(
    private readonly wrapper: WorkerBuilder,
    private readonly exportProcessor: ExportProcessor,
  ) {
    this.#worker = wrapper.build<ExportJobInput, ExportJobOutput>(
      exportPieceQueueName,
      {
        process: (job) => {
          return this.exportProcessor.run(job.data);
        },
      },
    );
  }
}
