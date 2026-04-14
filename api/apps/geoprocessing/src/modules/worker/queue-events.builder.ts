import { Injectable, Logger, OnModuleDestroy, Scope } from '@nestjs/common';
import { QueueEvents } from 'bullmq';
import { Config } from './config';

@Injectable({
  scope: Scope.TRANSIENT,
})
export class QueueEventsBuilder implements OnModuleDestroy {
  private readonly logger = new Logger(QueueEventsBuilder.name);
  private queueEvents?: QueueEvents;

  constructor(private readonly config: Config) {}

  buildQueueEvents(queueName: string): QueueEvents {
    if (this.queueEvents) {
      throw new Error('Queue Events is already created!');
    }
    this.queueEvents = new QueueEvents(queueName, this.config.redis);

    this.queueEvents.on('error', (err: Error) => {
      this.logger.error(
        `QueueEvents "${queueName}" error: ${err.message}`,
        err.stack,
      );
    });

    const label = `QueueEvents "${queueName}"`;
    this.queueEvents.client.then((client) => {
      client.on('connect', () => this.logger.log(`${label}: connected`));
      client.on('ready', () => this.logger.log(`${label}: ready`));
      client.on('close', () => this.logger.warn(`${label}: connection closed`));
      client.on('reconnecting', () =>
        this.logger.warn(`${label}: reconnecting`),
      );
      client.on('end', () => this.logger.error(`${label}: connection ended`));
    });

    return this.queueEvents;
  }

  async onModuleDestroy(): Promise<void> {
    if (this.queueEvents) {
      await this.queueEvents.close();
      await this.queueEvents.disconnect();
    }
  }
}
