import { Inject, Injectable } from '@nestjs/common';
import { JobsOptions, Queue, QueueEvents } from 'bullmq';
import { QueueNameToken } from './queue.tokens';
import { QueueBuilder } from './queue.builder';
import { QueueEventsBuilder } from './queue-events.builder';

/**
 * @deprecated
 */
@Injectable()
export class QueueService<NewJobInput, Opts extends JobsOptions = JobsOptions> {
  public readonly queue: Queue<NewJobInput, Opts>;
  public readonly events: QueueEvents;

  constructor(
    @Inject(QueueNameToken) queueName: string,
    queueBuilder: QueueBuilder<NewJobInput, Opts>,
    eventsBuilder: QueueEventsBuilder,
  ) {
    this.queue = queueBuilder.buildQueue(queueName);
    this.events = eventsBuilder.buildQueueEvents(queueName);
  }

  /**
   * typings aren't great...
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
}
