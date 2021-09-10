import { Injectable, OnModuleDestroy, Scope } from '@nestjs/common';
import { Job, Worker } from 'bullmq';
import { Config } from './config';
import { WorkerProcessor } from './worker-processor';

@Injectable({
  scope: Scope.TRANSIENT,
})
export class WorkerBuilder implements OnModuleDestroy {
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
      },
    );
    return this._worker;
  }

  async onModuleDestroy(): Promise<void> {
    if (this._worker) {
      await this._worker.close();
      await this._worker.disconnect();
    }
  }
}
