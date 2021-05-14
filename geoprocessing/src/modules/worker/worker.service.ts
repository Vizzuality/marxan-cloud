import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Worker, QueueScheduler, JobsOptions } from 'bullmq';
import {
  QueueSchedulerToken,
  WorkerExecutorToken,
  WorkerLoggerToken,
} from './worker.tokens';

@Injectable()
export class WorkerService<JobInput, Opts extends JobsOptions = JobsOptions>
  implements OnModuleDestroy {
  constructor(
    @Inject(WorkerLoggerToken) public readonly logger: Logger,
    @Inject(WorkerExecutorToken)
    public readonly worker: Worker<JobInput, Opts>,
    @Inject(QueueSchedulerToken) public readonly queueScheduler: QueueScheduler,
  ) {}

  /**
   * typings arent great...
   *
   * could be that base implementations are provided there
   * and overrided (if necessary) in usage
   *
   * @param event
   * @param listener
   */
  registerEventHandler(
    event:
      | 'waiting'
      | 'delayed'
      | 'progress'
      | 'stalled'
      | 'completed'
      | 'failed'
      | 'removed'
      | 'drained',
    listener: (args: {
      jobId: string;
      delay?: number;
      data?: string;
      returnValue?: string;
      failedReason?: string;
    }) => void,
  ) {
    this.worker.on(event, listener);
  }

  async onModuleDestroy(): Promise<void> {
    await this.queueScheduler.close();
    await this.queueScheduler.disconnect();
    await this.worker.close();
    await this.worker.disconnect();
  }
}
