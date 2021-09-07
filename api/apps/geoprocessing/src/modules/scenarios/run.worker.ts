import { Job, QueueEvents, Worker } from 'bullmq';
import { Inject, Injectable, ValueProvider } from '@nestjs/common';
import {
  JobData,
  ProgressData,
  queueName as scenarioRunQueueName,
} from '@marxan/scenario-run-queue';
import { ExecutionResult } from '@marxan/marxan-output';
import {
  WorkerBuilder,
  QueueEventsBuilder,
} from '@marxan-geoprocessing/modules/worker';
import { MarxanSandboxRunnerService } from '@marxan-geoprocessing/marxan-sandboxed-runner/marxan-sandbox-runner.service';

export const runWorkerQueueNameToken = Symbol(`run worker queue name token`);
export const runWorkerQueueNameProvider: ValueProvider<string> = {
  provide: runWorkerQueueNameToken,
  useValue: scenarioRunQueueName,
};

@Injectable()
export class RunWorker {
  private worker: Worker<JobData, ExecutionResult>;
  private queueEvents: QueueEvents;

  constructor(
    queueEventsBuilder: QueueEventsBuilder,
    workerBuilder: WorkerBuilder,
    @Inject(runWorkerQueueNameToken) queueName: string,
    private readonly marxanRunner: MarxanSandboxRunnerService,
  ) {
    this.worker = workerBuilder.build<JobData, ExecutionResult>(queueName, {
      process: async (job) => {
        try {
          return await this.run(job);
        } catch (error) {
          throw new Error(JSON.stringify(error));
        }
      },
    });
    this.queueEvents = queueEventsBuilder.buildQueueEvents(queueName);
    this.queueEvents.on(`progress`, ({ data }: { data: ProgressData }) => {
      this.handleProgress(data);
    });
  }

  private async run(job: Job<JobData>) {
    return await this.marxanRunner.run(
      job.data.scenarioId,
      job.data.assets,
      async (progress) => {
        const progressData: ProgressData = {
          scenarioId: job.data.scenarioId,
          fractionalProgress: progress,
        };
        await job.updateProgress(progressData);
      },
    );
  }

  private handleProgress(data: ProgressData) {
    if ('canceled' in data && data.canceled) {
      this.marxanRunner.kill(data.scenarioId);
    }
  }
}
