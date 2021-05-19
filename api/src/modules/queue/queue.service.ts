import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { JobsOptions, Queue, QueueEvents } from 'bullmq';
import { QueueEventsToken, QueueLoggerToken, QueueToken } from './queue.tokens';

@Injectable()
export class QueueService<NewJobInput, Opts extends JobsOptions = JobsOptions>
  implements OnModuleDestroy {
  constructor(
    @Inject(QueueLoggerToken) public readonly logger: Logger,
    @Inject(QueueToken) public readonly queue: Queue<NewJobInput, Opts>,
    @Inject(QueueEventsToken) public readonly events: QueueEvents,
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
    this.events.on(event, listener);
  }

  async onModuleDestroy(): Promise<void> {
    await (await this.events.client).quit();
    await (await this.events.client).disconnect();
    await (await this.queue.client).quit();
    await (await this.queue.client).disconnect();
    await this.events.close();
    await this.events.disconnect();
    await this.queue.close();
    await this.queue.disconnect();
  }
}
