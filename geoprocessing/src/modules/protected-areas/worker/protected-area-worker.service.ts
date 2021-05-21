import { Injectable } from '@nestjs/common';
import { WorkerResolver } from '../../worker';
import { ProtectedAreaProcessor } from './protected-area-processor';
import { queueName } from './queue-name';
import { Worker } from 'bullmq';

@Injectable()
export class ProtectedAreaWorkerService {
  #worker: Worker;

  constructor(
    private readonly wrapper: WorkerResolver,
    private readonly processor: ProtectedAreaProcessor,
  ) {
    this.#worker = wrapper.wrap(queueName, processor);
    this.#worker.on('completed', ({ returnvalue }) => {
      console.log(`---- trigger ApiEvent - ok `, returnvalue);
    });
    this.#worker.on('failed', ({ failedReason }) => {
      console.log(`---- trigger ApiEvent - failure `, failedReason);
    });
  }
}
