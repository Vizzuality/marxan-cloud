import { Injectable, OnModuleDestroy, Scope } from '@nestjs/common';
import { QueueEvents } from 'bullmq';
import { Config } from './config';

@Injectable({
  scope: Scope.TRANSIENT,
})
export class QueueEventsBuilder implements OnModuleDestroy {
  private queueEvents?: QueueEvents;

  constructor(private readonly config: Config) {}

  buildQueueEvents(queueName: string): QueueEvents {
    if (this.queueEvents) {
      throw new Error('Queue Events is already created!');
    }
    this.queueEvents = new QueueEvents(queueName, this.config.redis);
    return this.queueEvents;
  }

  async onModuleDestroy(): Promise<void> {
    if (this.queueEvents) {
      await this.queueEvents.close();
      await this.queueEvents.disconnect();
    }
  }
}
