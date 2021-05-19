import { Test, TestingModule } from '@nestjs/testing';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import * as config from 'config';

import { WorkerModule } from '../../src/modules/worker/worker.module';
import { WorkerService } from '../../src/modules/worker/worker.service';
import exampleWorkerJobProcessor from './bullmq-worker-code';

let app: TestingModule;
let queue: Queue;
let processor: ExampleProcessingService;

const queueName = 'test-queue';

/**
 * This tests USES redis to ensure that workers module works with full flow
 */
beforeAll(async () => {
  const sandbox = await Test.createTestingModule({
    imports: [
      WorkerModule.register({
        name: queueName,
        worker: exampleWorkerJobProcessor,
      }),
    ],
    providers: [ExampleProcessingService],
  }).compile();
  app = await sandbox.init();
  processor = app.get(ExampleProcessingService);

  queue = new Queue(queueName, {
    ...config.get('redisApi'),
  });
});

afterAll(async () => {
  await queue.close();
  await queue.disconnect();
  await app.close();
});

describe(`when submitting a job`, () => {
  it(`should process the job by relevant worker`, async () => {
    // Act - simulate pushing a job to queue
    const job = await queue.add('test-job', {
      test: 'data',
    });
    expect(job.id).toBeDefined();

    await delay(1000);
    expect(processor.onFailedMock.mock.calls).toEqual([]);
    expect(processor.onCompleteMock.mock.calls[0][0]).toEqual({
      inputCopy: jobInput,
    });
  });
});

const jobInput = Object.freeze({
  test: 'data',
});

const delay = (ms = 1000) => new Promise((resolve) => setTimeout(resolve, ms));

// Example service which uses WorkerModule;
// it can decide to post ApiEvents on various job results
@Injectable()
export class ExampleProcessingService {
  onCompleteMock = jest.fn();
  onFailedMock = jest.fn();

  constructor(private readonly workerService: WorkerService<typeof jobInput>) {
    this.workerService.registerEventHandler('completed', ({ returnvalue }) => {
      this.onCompleteMock(returnvalue);
    });
    this.workerService.registerEventHandler('failed', ({ failedReason }) => {
      this.onFailedMock(failedReason);
    });
  }
}
