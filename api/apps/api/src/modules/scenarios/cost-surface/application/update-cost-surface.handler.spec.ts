import { FakeLogger } from '@marxan-api/utils/__mocks__/fake-logger';
import { ConsoleLogger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Queue } from 'bullmq';
import { Either, Left, Right } from 'fp-ts/lib/Either';
import { jobSubmissionFailed } from '@marxan/scenario-cost-surface';
import { surfaceCostQueueToken } from '../infra/surface-cost-queue.provider';
import { CostSurfaceEventsPort } from '../ports/cost-surface-events.port';
import { UpdateCostSurface } from './update-cost-surface.command';
import { UpdateCostSurfaceHandler } from './update-cost-surface.handler';
import { CostSurfaceEventsFake } from './__mocks__/cost-surface-events-fake';

let sut: UpdateCostSurfaceHandler;
let logger: FakeLogger;
let addJobMock: jest.SpyInstance;
let eventsService: CostSurfaceEventsFake;

const scenarioId = 'scenarioId-id';
const shapefile: Express.Multer.File = {
  filename: 'file-name',
} as Express.Multer.File;

beforeEach(async () => {
  addJobMock = jest.fn();
  const sandbox = await Test.createTestingModule({
    providers: [
      UpdateCostSurfaceHandler,
      {
        provide: surfaceCostQueueToken,
        useValue: {
          add: addJobMock,
        } as unknown as Queue,
      },
      {
        provide: ConsoleLogger,
        useClass: FakeLogger,
      },
      {
        provide: CostSurfaceEventsPort,
        useClass: CostSurfaceEventsFake,
      },
    ],
  }).compile();

  sut = sandbox.get(UpdateCostSurfaceHandler);
  logger = sandbox.get(ConsoleLogger);
  eventsService = sandbox.get(CostSurfaceEventsPort);
});

describe(`when job submits successfully`, () => {
  let result: Either<typeof jobSubmissionFailed, true>;
  beforeEach(async () => {
    // Asset
    addJobMock.mockResolvedValue({ job: { id: 1 } });
    // Act
    result = await sut.execute(new UpdateCostSurface(scenarioId, shapefile));
  });

  it(`should return right`, () => {
    expect((result as Right<true>).right).toBe(true);
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
  let result: Either<typeof jobSubmissionFailed, true>;
  beforeEach(async () => {
    // Asset
    addJobMock.mockRejectedValue(new Error('Oups'));
    // Act
    result = await sut.execute(new UpdateCostSurface(scenarioId, shapefile));
  });

  it(`should return left`, () => {
    expect((result as Left<typeof jobSubmissionFailed>).left).toBe(
      jobSubmissionFailed,
    );
  });

  it(`should log the error`, () => {
    expect(logger.error.mock.calls[0]).toMatchInlineSnapshot(`
      Array [
        "Failed submitting cost-surface-for-scenarioId-id job",
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
