import {
  ProtectedAreasFacade,
  ProtectedAreasJobInput,
} from './protected-areas.facade';
import { Test } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { Queue } from 'bullmq';

import { QueueService } from '../../queue/queue.service';
import { FakeLogger } from '../../../utils/__mocks__/fake-logger';

let sut: ProtectedAreasFacade;
let logger: FakeLogger;
let addJobMock: jest.SpyInstance;

const projectId = 'project-id';
const file: Express.Multer.File = {
  filename: 'file-name',
} as Express.Multer.File;

beforeEach(async () => {
  addJobMock = jest.fn();
  const sandbox = await Test.createTestingModule({
    providers: [
      ProtectedAreasFacade,
      {
        provide: QueueService,
        useValue: ({
          queue: ({
            add: addJobMock,
          } as unknown) as Queue,
        } as unknown) as QueueService<ProtectedAreasJobInput>,
      },
      {
        provide: Logger,
        useClass: FakeLogger,
      },
    ],
  }).compile();

  sut = sandbox.get(ProtectedAreasFacade);
  logger = sandbox.get(Logger);
});

describe(`when job submits successfully`, () => {
  let result: unknown;
  beforeEach(() => {
    // Asset
    addJobMock.mockResolvedValue({ job: { id: 1 } });
    // Act
    result = sut.convert(projectId, file);
  });

  it(`should return`, () => {
    expect(result).toEqual(undefined);
  });

  it(`should put job to queue`, () => {
    expect(addJobMock.mock.calls[0]).toMatchInlineSnapshot(`
      Array [
        "protected-areas-for-project-id",
        Object {
          "file": Object {
            "filename": "file-name",
          },
          "projectId": "project-id",
        },
      ]
    `);
  });
});

describe(`when job submission fails`, () => {
  let result: unknown;
  beforeEach(() => {
    // Asset
    addJobMock.mockRejectedValue(new Error('Oups'));
    // Act
    result = sut.convert(projectId, file);
  });

  it(`should return`, () => {
    expect(result).toEqual(undefined);
  });

  it(`should log the error`, () => {
    expect(logger.error.mock.calls[0]).toMatchInlineSnapshot(`
      Array [
        "Failed submitting job to queue for project-id",
        [Error: Oups],
      ]
    `);
  });
});
