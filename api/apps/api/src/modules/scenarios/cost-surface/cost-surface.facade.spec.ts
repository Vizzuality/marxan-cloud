import { Test } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { Queue } from 'bullmq';

import { FakeLogger } from '@marxan-api/utils/__mocks__/fake-logger';
import { QueueService } from '@marxan-api/modules/queue/queue.service';

import { CostSurfaceFacade } from './cost-surface.facade';
import { CostSurfaceJobInput } from './job-input';
import { CostSurfaceEventsPort } from './cost-surface-events.port';

import { CostSurfaceEventsFake } from './__mocks__/cost-surface-events-fake';

let sut: CostSurfaceFacade;
let logger: FakeLogger;
let addJobMock: jest.SpyInstance;
let eventsService: CostSurfaceEventsFake;

const scenarioId = 'scenarioId-id';
const file: Express.Multer.File = {
  filename: 'file-name',
} as Express.Multer.File;

beforeEach(async () => {
  addJobMock = jest.fn();
  const sandbox = await Test.createTestingModule({
    providers: [
      CostSurfaceFacade,
      {
        provide: QueueService,
        useValue: ({
          queue: ({
            add: addJobMock,
          } as unknown) as Queue,
        } as unknown) as QueueService<CostSurfaceJobInput>,
      },
      {
        provide: Logger,
        useClass: FakeLogger,
      },
      {
        provide: CostSurfaceEventsPort,
        useClass: CostSurfaceEventsFake,
      },
    ],
  }).compile();

  sut = sandbox.get(CostSurfaceFacade);
  logger = sandbox.get(Logger);
  eventsService = sandbox.get(CostSurfaceEventsPort);
});

describe(`when job submits successfully`, () => {
  let result: unknown;
  beforeEach(async () => {
    // Asset
    addJobMock.mockResolvedValue({ job: { id: 1 } });
    // Act
    result = await sut.convert(scenarioId, file);
  });

  it(`should return`, () => {
    expect(result).toEqual(undefined);
  });

  it(`should put job to queue`, () => {
    expect(addJobMock.mock.calls[0]).toMatchInlineSnapshot(`
      Array [
        "cost-surface-for-scenarioId-id",
        Object {
          "scenarioId": "scenarioId-id",
          "shapefile": Object {
            "filename": "file-name",
          },
        },
      ]
    `);
  });

  it(`should emit 'submitted' event`, () => {
    expect(eventsService.mock.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          "scenarioId-id",
          "submitted",
          undefined,
        ],
      ]
    `);
  });
});

describe(`when job submission fails`, () => {
  let result: unknown;
  beforeEach(async () => {
    // Asset
    addJobMock.mockRejectedValue(new Error('Oups'));
    // Act
    try {
      result = await sut.convert(scenarioId, file);
    } catch (error) {
      //expected error, do nothing
    }
  });

  it(`should return`, () => {
    expect(result).toEqual(undefined);
  });

  it(`should log the error`, () => {
    expect(logger.error.mock.calls[0]).toMatchInlineSnapshot(`
      Array [
        "Failed submitting job to queue for scenarioId-id",
        "Error: Oups",
      ]
    `);
  });

  it(`emits both submitted&failed events`, () => {
    expect(eventsService.mock.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          "scenarioId-id",
          "submitted",
          undefined,
        ],
        Array [
          "scenarioId-id",
          "cost-update-failed",
          Object {
            "error": [Error: Oups],
          },
        ],
      ]
    `);
  });
});
