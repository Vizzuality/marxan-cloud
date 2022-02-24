import { Test, TestingModule } from '@nestjs/testing';
import { Injectable } from '@nestjs/common';
import { Job, Queue, Worker } from 'bullmq';
import * as config from 'config';

import { ExampleWorkerJobProcessor } from './bullmq-worker-code';
import { WorkerModule, WorkerBuilder } from '../../src/modules/worker';
import { getRedisConfig } from '@marxan-geoprocessing/utils/redisConfig.utils';

let app: TestingModule;
let queue: Queue;
let processor: ExampleProcessingService;

const queueName = 'test-queue';

/**
 * This tests USES redis to ensure that workers module works with full flow
 */
beforeAll(async () => {
  const sandbox = await Test.createTestingModule({
    imports: [WorkerModule],
    providers: [ExampleProcessingService],
  }).compile();
  app = await sandbox.init();
  processor = app.get(ExampleProcessingService);

  queue = new Queue(queueName, getRedisConfig());
});

afterAll(async () => {
  await queue.close();
  await queue.disconnect();
  await app.close();
}, 10 * 1000);

describe(`when submitting a job`, () => {
  it(
    `should process the job by relevant worker`,
    async () => {
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
    },
    10 * 1000,
  );
});

const jobInput = Object.freeze({
  test: 'data',
});

const delay = (ms = 1000) => new Promise((resolve) => setTimeout(resolve, ms));

@Injectable()
export class ExampleProcessingService {
  onCompleteMock = jest.fn();
  onFailedMock = jest.fn();

  #worker: Worker;

  constructor(private readonly wrapper: WorkerBuilder) {
    this.#worker = wrapper.build(queueName, new ExampleWorkerJobProcessor());
    this.#worker.on('completed', ({ returnvalue }) => {
      this.onCompleteMock(returnvalue);
    });
    this.#worker.on('failed', ({ failedReason }: Job) => {
      this.onFailedMock(failedReason);
    });
  }
}
