import { Inject, Injectable } from '@nestjs/common';
import { Job, Worker } from 'bullmq';
import {
  CopyJobData,
  SplitJobData,
  StratificationJobData,
} from '@marxan/geofeature-calculations';
import { WorkerBuilder } from '@marxan-geoprocessing/modules/worker';
import {
  copyQueueNameToken,
  copyWorkerBuilderToken,
  splitQueueNameToken,
  splitWorkerBuilderToken,
  stratificationQueueNameToken,
  stratificationWorkerBuilderToken,
} from './worker-builder.providers';

@Injectable()
export class ProcessingWorker {
  private copyWorker: Worker<CopyJobData, void>;
  private splitWorker: Worker<SplitJobData, void>;
  private stratificationWorker: Worker<StratificationJobData, void>;
  constructor(
    @Inject(copyQueueNameToken)
    copyQueueName: string,
    @Inject(copyWorkerBuilderToken) copyWorkerBuilder: WorkerBuilder,
    @Inject(splitQueueNameToken)
    splitQueueName: string,
    @Inject(splitWorkerBuilderToken) splitWorkerBuilder: WorkerBuilder,
    @Inject(stratificationQueueNameToken)
    stratificationQueueName: string,
    @Inject(stratificationWorkerBuilderToken)
    stratificationWorkerBuilder: WorkerBuilder,
  ) {
    this.copyWorker = copyWorkerBuilder.build<CopyJobData, void>(
      copyQueueName,
      {
        process: this.copyProcess.bind(this),
      },
    );
    this.splitWorker = splitWorkerBuilder.build<SplitJobData, void>(
      splitQueueName,
      {
        process: this.splitProcess.bind(this),
      },
    );
    this.stratificationWorker = stratificationWorkerBuilder.build<
      StratificationJobData,
      void
    >(stratificationQueueName, {
      process: this.stratificationProcess.bind(this),
    });
  }

  async copyProcess(_job: Job<CopyJobData>): Promise<void> {
    //
  }

  async splitProcess(_job: Job<SplitJobData>): Promise<void> {
    //
  }

  async stratificationProcess(_job: Job<StratificationJobData>): Promise<void> {
    //
  }
}
