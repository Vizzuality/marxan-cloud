import { Test, TestingModule } from '@nestjs/testing';
import { Injectable, Module } from '@nestjs/common';
import { Job, Queue, Worker } from 'bullmq';
import {
  WorkerBuilder,
  WorkerModule,
  WorkerProcessor,
} from '../../src/modules/worker';
import { getRedisConfig } from '@marxan-geoprocessing/utils/redisConfig.utils';

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

  queue = new Queue(queueName, getRedisConfig());
});

afterAll(async () => {
  await queue.close();
  await queue.disconnect();
  await app.close();
});

describe(`when submitting a job`, () => {
  it(`should process the job by relevant worker`, async () => {
    const onCompleteMockCallback =
      (resolve: (value?: any) => void) => (result: any) => {
        expect(result).toEqual({
          finish: initValue + addValue,
        });
        resolve();
      };

    const onFailedMockCallback =
      (resolve: (value?: any) => void, reject: (reason?: any) => void) =>
      () => {
        reject('Fail callback called, not expected');
      };

    return new Promise(async (resolve, reject) => {
      processor.onFailedMock = jest.fn(onFailedMockCallback(resolve, reject));
      processor.onCompleteMock = jest.fn(onCompleteMockCallback(resolve));

      const job = await queue.add('test-job', jobInput);
      expect(job.id).toBeDefined();
    });
  });
});

const jobInput = Object.freeze({
  init: initValue,
});

@Injectable()
class ModuleADependency {
  getOne() {
    return addValue;
  }
}

@Module({
  providers: [ModuleADependency],
  exports: [ModuleADependency],
})
class ModuleA {}

@Injectable()
class JobProcessor
  implements WorkerProcessor<{ init: number }, { finish: number }>
{
  constructor(private readonly moduleADependency: ModuleADependency) {}

  process(
    job: Job<{ init: number }, { finish: number }>,
  ): Promise<{ finish: number }> {
    return Promise.resolve({
      finish: job.data.init + this.moduleADependency.getOne(),
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
