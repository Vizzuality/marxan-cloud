import { PromiseType } from 'utility-types';
import {
  FileNotFound,
  FileNotReady,
  FilePiped,
} from './scenario-cost-surface-template.service';
import * as stream from 'stream';
import { Test } from '@nestjs/testing';
import { QueuedCostTemplateService } from './queued-cost-template.service';
import { Queue } from './queue';
import { Storage } from './storage';
import { FakeStorage } from './__mocks__/fake.storage';
import { FakeQueue } from './__mocks__/fake.queue';

let fixtures: PromiseType<ReturnType<typeof getFixtures>>;
let service: QueuedCostTemplateService;

beforeEach(async () => {
  fixtures = await getFixtures();
  service = fixtures.getService();
});

describe(`when file is not in storage and there is no job for a file`, () => {
  let result: PromiseType<ReturnType<typeof service.getTemplateShapefile>>;
  beforeEach(async () => {
    // given
    fixtures.emptyStorage();
    // and
    fixtures.noPendingJobs();
    // when
    result = await service.getTemplateShapefile('1234', new stream.Writable());
  });

  // then
  it(`should return that the file cannot be found`, async () => {
    expect(result).toBe(FileNotFound);
  });
});

describe(`when file is not in storage and there is no job for a file`, () => {
  let result: PromiseType<ReturnType<typeof service.getTemplateShapefile>>;
  beforeEach(async () => {
    // given
    fixtures.emptyStorage();
    // and
    fixtures.setPendingJobFor('1234');
    // when
    result = await service.getTemplateShapefile('1234', new stream.Writable());
  });

  // then
  it(`should return that the file cannot be found`, async () => {
    expect(result).toBe(FileNotReady);
  });
});

describe(`when file is in storage`, () => {
  let result: PromiseType<ReturnType<typeof service.getTemplateShapefile>>;
  let writableStream: stream.Writable & {
    data: any[];
  };
  beforeEach(async () => {
    // given
    fixtures.fileInStorage('1234', 'a file in storage');
    // and
    writableStream = fixtures.writableStream();
    // when
    result = await service.getTemplateShapefile('1234', writableStream);
  });

  // then
  it(`should return that the file was piped`, () => {
    expect(result).toBe(FilePiped);
  });

  // and
  it(`should contain the file in a stream`, () => {
    expect(writableStream.data).toStrictEqual([
      Buffer.from('a file in storage'),
    ]);
  });
});

describe('when scheduling a creation', () => {
  beforeEach(async () => {
    // given
    fixtures.noPendingJobs();
    // when
    await service.scheduleTemplateShapefileCreation('123');
  });

  // then
  it(`should schedule a creation in the queue`, () => {
    fixtures.hasQueuedPendingJobs(['123']);
  });
});

const getFixtures = async () => {
  const testingModule = await Test.createTestingModule({
    providers: [
      {
        provide: Storage,
        useClass: FakeStorage,
      },
      {
        provide: Queue,
        useClass: FakeQueue,
      },
      QueuedCostTemplateService,
    ],
  }).compile();
  const storage: FakeStorage = testingModule.get(Storage);
  const queue: FakeQueue = testingModule.get(Queue);

  const fixtures = {
    emptyStorage() {
      storage.memory = {};
    },
    noPendingJobs() {
      queue.activeJobs = [];
    },
    getService(): QueuedCostTemplateService {
      return testingModule.get(QueuedCostTemplateService);
    },
    setPendingJobFor(scenarioId: string) {
      queue.activeJobs.push(scenarioId);
    },
    fileInStorage(scenarioId: string, buffer: string) {
      const readableStream = new stream.Readable();
      readableStream.push(buffer);
      readableStream.push(null);
      storage.memory[scenarioId] = readableStream;
    },
    writableStream(): stream.Writable & { data: any[] } {
      const writableStream = new (class extends stream.Writable {
        public readonly data: any[] = [];
        _write(
          chunk: any,
          encoding: BufferEncoding,
          callback: (error?: Error | null) => void,
        ) {
          this.data.push(chunk);
          callback();
        }
      })();
      return writableStream;
    },
    hasQueuedPendingJobs(scenarioIds: string[]) {
      expect(queue.activeJobs).toStrictEqual(scenarioIds);
    },
  };
  return fixtures;
};
