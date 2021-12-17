import { Job, QueueEvents, Worker } from 'bullmq';
import { Inject, Injectable } from '@nestjs/common';
import { JobData, ProgressData } from '@marxan/scenario-run-queue';
import { ExecutionResult } from '@marxan/marxan-output';
import {
  QueueEventsBuilder,
  WorkerBuilder,
} from '@marxan-geoprocessing/modules/worker';
import { SandboxRunner } from '@marxan-geoprocessing/marxan-sandboxed-runner/ports/sandbox-runner';
import { runWorkerQueueNameToken, sandboxRunnerToken } from './tokens';

@Injectable()
export class RunWorker {
  private worker: Worker<JobData, ExecutionResult>;
  private queueEvents: QueueEvents;

  constructor(
    queueEventsBuilder: QueueEventsBuilder,
    workerBuilder: WorkerBuilder,
    @Inject(runWorkerQueueNameToken) queueName: string,
    @Inject(sandboxRunnerToken)
    private readonly marxanRunner: SandboxRunner<JobData, ExecutionResult>,
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
    return await this.marxanRunner.run(job.data, async (progress) => {
      const progressData: ProgressData = {
        scenarioId: job.data.scenarioId,
        fractionalProgress: progress,
      };
      await job.updateProgress(progressData);
    });
  }

  private handleProgress(data: ProgressData) {
    if ('canceled' in data && data.canceled) {
      this.marxanRunner.kill(data.scenarioId);
    }
  }
}
