import { Inject, Injectable, OnModuleDestroy, Scope } from '@nestjs/common';
import { Queue, QueueOptions } from 'bullmq';
import { queueOptionsToken } from './queue-options.provider';

@Injectable({
  scope: Scope.TRANSIENT,
})
export class QueueBuilder<Input = any, Output = any>
  implements OnModuleDestroy {
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
    return this.queue;
  }

  async onModuleDestroy(): Promise<void> {
    if (this.queue) {
      await this.queue.close();
      await this.queue.disconnect();
    }
  }
}
