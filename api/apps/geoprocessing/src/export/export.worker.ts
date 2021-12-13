import { Injectable } from '@nestjs/common';
import { Worker } from 'bullmq';

import { exportPieceQueueName, JobInput, JobOutput } from '@marxan/cloning';
import { WorkerBuilder } from '@marxan-geoprocessing/modules/worker';

import { ExportProcessor } from './export.processor';

@Injectable()
export class ExportWorker {
  #worker: Worker<JobInput, JobOutput>;

  constructor(
    private readonly wrapper: WorkerBuilder,
    private readonly exportProcessor: ExportProcessor,
  ) {
    this.#worker = wrapper.build<JobInput, JobOutput>(exportPieceQueueName, {
      process: async (job) => {
        try {
          return await this.exportProcessor.run(job.data);
        } catch (error) {
          throw new Error(JSON.stringify(error));
        }
      },
    });
  }
}
