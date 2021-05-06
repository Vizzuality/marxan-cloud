import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { JobsOptions, Queue, QueueEvents } from 'bullmq';
import { QueueNameToken } from './queue.tokens';
import * as config from 'config';

@Injectable()
export class QueueService<NewJobInput, Opts extends JobsOptions = JobsOptions>
  implements OnModuleDestroy {
  public readonly name: string;
  public readonly logger: Logger;
  public readonly queue: Queue<NewJobInput, Opts>;
  public readonly events: QueueEvents;

  constructor(@Inject(QueueNameToken) queueName: string) {
    this.name = queueName;
    this.logger = new Logger(`${queueName}-queue-publisher`);
    this.queue = new Queue(queueName, {
      ...config.get('redisApi'),
      defaultJobOptions: config.get('jobOptions'),
    });
    this.events = new QueueEvents(queueName, config.get('redisApi'));
  }

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
    await this.events.close();
    await this.events.disconnect();
    await this.queue.close();
    await this.queue.disconnect();
  }
}
