import { bullmqPrefix } from '@marxan/utils';
import { Injectable, Logger, OnModuleDestroy, Scope } from '@nestjs/common';
import { Job, Worker } from 'bullmq';
import { Config } from './config';
import { WorkerProcessor } from './worker-processor';

@Injectable({
  scope: Scope.TRANSIENT,
})
export class WorkerBuilder implements OnModuleDestroy {
  private readonly logger = new Logger(WorkerBuilder.name);
  private _worker?: Worker;

  constructor(private readonly config: Config) {}

  build<Input, Output>(
    queueName: string,
    processor: WorkerProcessor<Input, Output>,
  ): Worker<Input, Output> {
    if (this._worker) {
      throw new Error('Worker is already created!');
    }
    this._worker = new Worker<Input, Output>(
      queueName,
      (job: Job) => processor.process(job),
      {
        ...this.config.redis,
        lockDuration: 60000,
        lockRenewTime: 10000,
        concurrency: 10,
        prefix: bullmqPrefix(),
      },
    );

    this._worker.on('error', (err: Error) => {
      this.logger.error(
        `Worker "${queueName}" error: ${err.message}`,
        err.stack,
      );
    });

    const label = `Worker "${queueName}"`;
    this._worker.client.then((client) => {
      client.on('connect', () => this.logger.log(`${label}: connected`));
      client.on('ready', () => this.logger.log(`${label}: ready`));
      client.on('close', () => this.logger.warn(`${label}: connection closed`));
      client.on('reconnecting', () =>
        this.logger.warn(`${label}: reconnecting`),
      );
      client.on('end', () => this.logger.error(`${label}: connection ended`));
    });

    return this._worker;
  }

  async onModuleDestroy(): Promise<void> {
    if (this._worker) {
      await this._worker.close();
      await this._worker.disconnect();
    }
  }
}
