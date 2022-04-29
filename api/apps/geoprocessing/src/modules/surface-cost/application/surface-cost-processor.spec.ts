import { Test } from '@nestjs/testing';
import { v4 } from 'uuid';
import { GetAvailablePlanningUnits } from '../ports/available-planning-units/get-available-planning-units';
import { CostSurfacePersistencePort } from '../ports/persistence/cost-surface-persistence.port';
import { PuExtractorPort } from '../ports/pu-extractor/pu-extractor.port';
import { ShapefileConverterPort } from '../ports/shapefile-converter/shapefile-converter.port';
import { SurfaceCostProcessor } from './surface-cost-processor';
import {
  getAreaByPlanningUnit,
  getCostByAreaOfPlanningUnit,
} from './__mocks__/area';
import { getCostByPlanningUnit } from './__mocks__/cost';
import { CostSurfaceRepoFake } from './__mocks__/cost-surface-repo.fake';
import { getGeoJson } from './__mocks__/geojson';
import { GetAvailablePuidsFake } from './__mocks__/get-available-puids.fake';
import { getFromShapeFileJob, getInitialCostJob } from './__mocks__/job.data';
import { PuExtractorFake } from './__mocks__/pu-extractor.fake';
import { ShapefileConverterFake } from './__mocks__/shapefile-converter.fake';

let sut: SurfaceCostProcessor;

let fileConverter: ShapefileConverterFake;
let puExtractor: PuExtractorFake;
let puRepo: GetAvailablePuidsFake;
let repo: CostSurfaceRepoFake;

const availablePlanningUnitPuids = [1, 2, 3];
const availablePlanningUnitIds = [v4(), v4(), v4()];
const missingPlanningUnitPuids = [1, 4];

beforeEach(async () => {
  const sandbox = await Test.createTestingModule({
    providers: [
      SurfaceCostProcessor,
      {
        provide: CostSurfacePersistencePort,
        useClass: CostSurfaceRepoFake,
      },
      {
        provide: PuExtractorPort,
        useClass: PuExtractorFake,
      },
      {
        provide: GetAvailablePlanningUnits,
        useClass: GetAvailablePuidsFake,
      },
      {
        provide: ShapefileConverterPort,
        useClass: ShapefileConverterFake,
      },
    ],
  }).compile();

  sut = sandbox.get(SurfaceCostProcessor);
  fileConverter = sandbox.get(ShapefileConverterPort);
  puExtractor = sandbox.get(PuExtractorPort);
  puRepo = sandbox.get(GetAvailablePlanningUnits);
  repo = sandbox.get(CostSurfacePersistencePort);
});

const scenarioId = v4();

describe('when processing shapefile job input', () => {
  describe(`when shapefile couldn't be converted`, () => {
    beforeEach(() => {
      fileConverter.mock.mockRejectedValue(
        new Error('Its a cat, not a shapefile!'),
      );
    });

    it(`should throw`, async () => {
      await expect(
        sut.process(getFromShapeFileJob(scenarioId)),
      ).rejects.toThrow(/a cat/);
    });
  });

  describe(`when shapefile was converted to geojson`, () => {
    beforeEach(() => {
      fileConverter.mock.mockResolvedValue(
        getGeoJson(availablePlanningUnitPuids),
      );
    });

    describe(`when cost is missing in properties`, () => {
      beforeEach(() => {
        puExtractor.mock.mockImplementationOnce(() => {
          throw new Error(`Missing surface cost properties.`);
        });
      });

      it(`should throw`, async () => {
        await expect(
          sut.process(getFromShapeFileJob(scenarioId)),
        ).rejects.toThrow(/Missing/);
        expect(puExtractor.mock).toHaveBeenCalledWith(
          getGeoJson(availablePlanningUnitPuids),
        );
      });
    });

    describe(`when cost was resolved`, () => {
      const cost = getCostByPlanningUnit(availablePlanningUnitPuids);
      beforeEach(() => {
        puExtractor.mock.mockReturnValue(cost);
      });

      describe(`when provided PUs do not belong to given scenario`, () => {
        beforeEach(() => {
          puRepo.mock.mockResolvedValue(
            missingPlanningUnitPuids.map((puid) => ({ id: v4(), puid })),
          );
        });

        it(`should throw`, async () => {
          await expect(
            sut.process(getFromShapeFileJob(scenarioId)),
          ).rejects.toThrow(/this project doesn't have a planning unit with/gi);
          expect(puRepo.mock).toHaveBeenCalledWith(scenarioId);
        });
      });

      describe(`when provided PUs belong to given scenario`, () => {
        beforeEach(() => {
          puRepo.mock.mockResolvedValue(
            availablePlanningUnitPuids.map((puid) => ({ id: v4(), puid })),
          );
        });

        it(`should persist the results`, async () => {
          expect(await sut.process(getFromShapeFileJob(scenarioId))).toEqual(
            true,
          );

          const costArray = cost.map((shapefileRecord) => ({
            cost: shapefileRecord.cost,
            id: expect.any(String),
          }));

          expect(repo.saveMock).toHaveBeenCalledWith(scenarioId, costArray);
        });
      });
    });
  });
});

describe('when processing initial cost job input', () => {
  const area = getAreaByPlanningUnit(availablePlanningUnitIds);
  const costByArea = getCostByAreaOfPlanningUnit(area);
  beforeEach(() => {
    puRepo.mock.mockResolvedValue(
      availablePlanningUnitPuids.map((puid) => ({ id: v4(), puid })),
    );
    puRepo.getPUsWithAreaMock.mockResolvedValue(area);
  });

  it('should persist cost based on area for all planning units', async () => {
    expect(await sut.process(getInitialCostJob(scenarioId))).toEqual(true);
    expect(repo.saveMock).toHaveBeenCalledWith(scenarioId, costByArea);
  });
});
