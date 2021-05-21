import { Test, TestingModule } from '@nestjs/testing';
import { Injectable, Module } from '@nestjs/common';
import { Job, Queue, Worker } from 'bullmq';
import * as config from 'config';
import {
  WorkerModule,
  WorkerProcessor,
  WorkerBuilder,
} from '../../src/modules/worker';

let app: TestingModule;
let queue: Queue;
let processor: ExampleProcessingService;

const queueName = 'test-queue';
const initValue = 5;
const addValue = 3;

/**
 * This tests USES redis to ensure that workers module works with full flow
 */
beforeAll(async () => {
  const sandbox = await Test.createTestingModule({
    imports: [WorkerModule, ModuleA],
    providers: [ExampleProcessingService, JobProcessor],
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
    const job = await queue.add('test-job', jobInput);
    expect(job.id).toBeDefined();

    await delay(1000);
    expect(processor.onFailedMock.mock.calls).toEqual([]);
    expect(processor.onCompleteMock.mock.calls[0][0]).toEqual({
      finish: initValue + addValue,
    });
  });
});

const jobInput = Object.freeze({
  init: initValue,
});

const delay = (ms = 1000) => new Promise((resolve) => setTimeout(resolve, ms));

@Injectable()
class ModuleADepdendency {
  getOne() {
    return addValue;
  }
}

@Module({
  providers: [ModuleADepdendency],
  exports: [ModuleADepdendency],
})
class ModuleA {}

@Injectable()
class JobProcessor
  implements WorkerProcessor<{ init: number }, { finish: number }> {
  constructor(private readonly moduleADepdendency: ModuleADepdendency) {}

  process(
    job: Job<{ init: number }, { finish: number }>,
  ): Promise<{ finish: number }> {
    return Promise.resolve({
      finish: job.data.init + this.moduleADepdendency.getOne(),
    });
  }
}

@Injectable()
class ExampleProcessingService {
  onCompleteMock = jest.fn();
  onFailedMock = jest.fn();

  #worker: Worker;

  constructor(
    private readonly wrapper: WorkerBuilder,
    private readonly processor: JobProcessor,
  ) {
    this.#worker = wrapper.build(queueName, processor);
    this.#worker.on('completed', ({ returnvalue }) => {
      this.onCompleteMock(returnvalue);
    });
    this.#worker.on('failed', ({ failedReason }: Job) => {
      this.onFailedMock(failedReason);
    });
  }
}
