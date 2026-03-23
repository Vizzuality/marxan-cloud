import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  Scope,
} from '@nestjs/common';
import { Queue, QueueOptions } from 'bullmq';
import { queueOptionsToken } from './queue-options.provider';

@Injectable({
  scope: Scope.TRANSIENT,
})
export class QueueBuilder<Input = any, Output = any>
  implements OnModuleDestroy
{
  private readonly logger = new Logger(QueueBuilder.name);
  private queue?: Queue;

  constructor(
    @Inject(queueOptionsToken)
    private readonly queueOptions: QueueOptions,
  ) {}

  buildQueue(queueName: string): Queue<Input, Output> {
    if (this.queue) {
      throw new Error('Queue is already created!');
    }
    this.queue = new Queue<Input, Output>(queueName, this.queueOptions);

    this.queue.on('error', (err: Error) => {
      this.logger.error(
        `Queue "${queueName}" error: ${err.message}`,
        err.stack,
      );
    });

    const label = `Queue "${queueName}"`;
    this.queue.client.then((client) => {
      client.on('connect', () => this.logger.log(`${label}: connected`));
      client.on('ready', () => this.logger.log(`${label}: ready`));
      client.on('close', () => this.logger.warn(`${label}: connection closed`));
      client.on('reconnecting', () =>
        this.logger.warn(`${label}: reconnecting`),
      );
      client.on('end', () => this.logger.error(`${label}: connection ended`));
    });

    return this.queue;
  }

  async onModuleDestroy(): Promise<void> {
    if (this.queue) {
      await this.queue.close();
      await this.queue.disconnect();
    }
  }
}
