import { CostSurfaceFacade } from './cost-surface.facade';
import { Test } from '@nestjs/testing';
import { Request } from 'express';
import { AdjustCostSurface } from '../../analysis/entry-points/adjust-cost-surface';
import { AdjustCostServiceFake } from './__mocks__/adjust-cost-service-fake';
import { ResolvePuWithCost } from './resolve-pu-with-cost';
import { ShapefileConverterFake } from './__mocks__/shapefile-converter-fake';
import { CostSurfaceEventsPort } from './cost-surface-events.port';
import { CostSurfaceEventsFake } from './__mocks__/cost-surface-events-fake';
import { getValidSurfaceCost } from './__mocks__/surface-cost.data';

let sut: CostSurfaceFacade;

let costService: AdjustCostServiceFake;
let fileConverter: ShapefileConverterFake;
let events: CostSurfaceEventsFake;

beforeEach(async () => {
  const sandbox = await Test.createTestingModule({
    providers: [
      {
        provide: AdjustCostSurface,
        useClass: AdjustCostServiceFake,
      },
      {
        provide: ResolvePuWithCost,
        useClass: ShapefileConverterFake,
      },
      {
        provide: CostSurfaceEventsPort,
        useClass: CostSurfaceEventsFake,
      },
      CostSurfaceFacade,
    ],
  }).compile();

  sut = sandbox.get(CostSurfaceFacade);
  costService = sandbox.get(AdjustCostSurface);
  fileConverter = sandbox.get(ResolvePuWithCost);
  events = sandbox.get(CostSurfaceEventsPort);
});

const scenarioId = 'scenarioId';
const request: Request = Object.freeze({
  file: ({ fakeFile: 1 } as unknown) as Express.Multer.File,
} as unknown) as Request;

describe(`when file couldn't be converted`, () => {
  beforeEach(async () => {
    fileConverter.mock.mockRejectedValue(new Error('Not a shapefile.'));

    // Act
    await sut.convert(scenarioId, request);
  });

  it(`should emit relevant events`, () => {
    expect(events.events).toMatchInlineSnapshot(`
      Array [
        Array [
          "scenarioId",
          "submitted",
        ],
        Array [
          "scenarioId",
          "shapefile-conversion-failed",
        ],
      ]
    `);
  });
});

describe(`when file can be converted`, () => {
  beforeEach(() => {
    fileConverter.mock.mockResolvedValue(getValidSurfaceCost());
  });

  describe(`when cost couldn't be adjusted`, () => {
    beforeEach(async () => {
      costService.mock.mockRejectedValue(new Error('SQL Error'));

      // Act
      await sut.convert(scenarioId, request);
    });

    it(`should emit relevant events`, () => {
      expect(events.events).toMatchInlineSnapshot(`
        Array [
          Array [
            "scenarioId",
            "submitted",
          ],
          Array [
            "scenarioId",
            "shapefile-converted",
          ],
          Array [
            "scenarioId",
            "cost-update-failed",
          ],
        ]
      `);
    });
  });

  describe(`when cost can be adjusted`, () => {
    beforeEach(async () => {
      costService.mock.mockResolvedValue(undefined);

      // Act
      await sut.convert(scenarioId, request);
    });

    it(`proxies file to port`, () => {
      expect(fileConverter.mock.mock.calls[0][0]).toEqual(request.file);
    });

    it(`proxies port output to update service`, () => {
      expect(costService.mock.mock.calls[0][0]).toEqual(scenarioId);
      expect(costService.mock.mock.calls[0][1]).toEqual(getValidSurfaceCost());
    });

    it(`emits valid events chain`, () => {
      expect(events.events).toMatchInlineSnapshot(`
        Array [
          Array [
            "scenarioId",
            "submitted",
          ],
          Array [
            "scenarioId",
            "shapefile-converted",
          ],
          Array [
            "scenarioId",
            "finished",
          ],
        ]
      `);
    });
  });
});
