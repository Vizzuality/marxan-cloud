import { Inject, Injectable } from '@nestjs/common';
import { Job, QueueEvents, Worker } from 'bullmq';
import {
  CopyJobData,
  FeaturesJobCancelProgress,
  FeaturesJobProgress,
  SplitJobData,
  StratificationJobData,
} from '@marxan/geofeature-calculations';
import { WorkerBuilder } from '@marxan-geoprocessing/modules/worker';
import {
  copyQueueEventsToken,
  copyQueueNameToken,
  copyWorkerBuilderToken,
  splitQueueEventsToken,
  splitQueueNameToken,
  splitWorkerBuilderToken,
  stratificationQueueEventsToken,
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
    @Inject(copyQueueEventsToken)
    copyQueueEvents: QueueEvents,
    @Inject(splitQueueEventsToken)
    splitQueueEvents: QueueEvents,
    @Inject(stratificationQueueEventsToken)
    stratificationQueueEvents: QueueEvents,
  ) {
    this.copyWorker = copyWorkerBuilder.build<CopyJobData, void>(
      copyQueueName,
      {
        process: this.copyProcess.bind(this),
      },
    );
    copyQueueEvents.on(
      `progress`,
      async ({ data }: { data: FeaturesJobProgress }) => {
        if (this.isCancel(data)) await this.cancelCopy(data);
      },
    );
    this.splitWorker = splitWorkerBuilder.build<SplitJobData, void>(
      splitQueueName,
      {
        process: this.splitProcess.bind(this),
      },
    );
    splitQueueEvents.on(
      `progress`,
      async ({ data }: { data: FeaturesJobProgress }) => {
        if (this.isCancel(data)) await this.cancelSplit(data);
      },
    );
    this.stratificationWorker = stratificationWorkerBuilder.build<
      StratificationJobData,
      void
    >(stratificationQueueName, {
      process: this.stratificationProcess.bind(this),
    });
    stratificationQueueEvents.on(
      `progress`,
      async ({ data }: { data: FeaturesJobProgress }) => {
        if (this.isCancel(data)) await this.cancelStratification(data);
      },
    );
  }

  private async copyProcess(_job: Job<CopyJobData>): Promise<void> {
    //
  }

  private async splitProcess(_job: Job<SplitJobData>): Promise<void> {
    //
  }

  private async stratificationProcess(
    _job: Job<StratificationJobData>,
  ): Promise<void> {
    //
  }

  private async cancelCopy(_data: FeaturesJobCancelProgress): Promise<void> {
    //
  }

  private async cancelSplit(_data: FeaturesJobCancelProgress): Promise<void> {
    //
  }

  private async cancelStratification(
    _data: FeaturesJobCancelProgress,
  ): Promise<void> {
    //
  }

  private isCancel(
    data: FeaturesJobProgress,
  ): data is FeaturesJobCancelProgress {
    return data.type === 'canceled' && data.canceled;
  }
}
