import { QueueService } from '@marxan-api/modules/queue/queue.service';
import { FakeLogger } from '@marxan-api/utils/__mocks__/fake-logger';
import { JobInput } from '@marxan/scenarios-planning-unit';
import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Queue } from 'bullmq';
import { CostSurfaceEventsPort } from './cost-surface-events.port';
import { CostSurfaceFacade } from './cost-surface.facade';
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
        } as unknown) as QueueService<JobInput>,
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
  beforeEach(() => {
    // Asset
    addJobMock.mockResolvedValue({ job: { id: 1 } });
    // Act
    result = sut.convert(scenarioId, file);
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
  beforeEach(() => {
    // Asset
    addJobMock.mockRejectedValue(new Error('Oups'));
    // Act
    result = sut.convert(scenarioId, file);
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
