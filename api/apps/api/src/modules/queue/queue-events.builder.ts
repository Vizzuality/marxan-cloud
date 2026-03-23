import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  Scope,
} from '@nestjs/common';
import { QueueEvents, QueueOptions } from 'bullmq';
import { queueOptionsToken } from './queue-options.provider';

@Injectable({
  scope: Scope.TRANSIENT,
})
export class QueueEventsBuilder implements OnModuleDestroy {
  private readonly logger = new Logger(QueueEventsBuilder.name);
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
