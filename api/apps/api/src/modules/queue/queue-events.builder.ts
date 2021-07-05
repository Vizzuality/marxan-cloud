import { Inject, Injectable, OnModuleDestroy, Scope } from '@nestjs/common';
import { QueueEvents, QueueOptions } from 'bullmq';
import { queueOptionsToken } from './queue-options.provider';

@Injectable({
  scope: Scope.TRANSIENT,
})
export class QueueEventsBuilder implements OnModuleDestroy {
  private queueEvents?: QueueEvents;

  constructor(
    @Inject(queueOptionsToken)
    private readonly queueOptions: QueueOptions,
  ) {}

  buildQueueEvents(queueName: string): QueueEvents {
    if (this.queueEvents) {
      throw new Error('Queue Events is already created!');
    }
    this.queueEvents = new QueueEvents(queueName, this.queueOptions);
    return this.queueEvents;
  }

  async onModuleDestroy(): Promise<void> {
    if (this.queueEvents) {
      await this.queueEvents.close();
      await this.queueEvents.disconnect();
    }
  }
}
