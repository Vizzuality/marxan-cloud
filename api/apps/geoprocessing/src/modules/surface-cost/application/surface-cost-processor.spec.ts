import { Test } from '@nestjs/testing';
import { v4 } from 'uuid';

import { SurfaceCostProcessor } from './surface-cost-processor';

import { CostSurfacePersistencePort } from '../ports/persistence/cost-surface-persistence.port';
import { PuExtractorPort } from '../ports/pu-extractor/pu-extractor.port';
import { ArePuidsAllowedPort } from '../ports/pu-validator/are-puuids-allowed.port';
import { ShapefileConverterPort } from '../ports/shapefile-converter/shapefile-converter.port';

import { ShapefileConverterFake } from './__mocks__/shapefile-converter.fake';
import { PuExtractorFake } from './__mocks__/pu-extractor.fake';
import { ArePuidsAllowedFake } from './__mocks__/are-puids-allowed.fake';
import { CostSurfaceRepoFake } from './__mocks__/cost-surface-repo.fake';

import { getJob } from './__mocks__/job.data';
import { getGeoJson } from './__mocks__/geojson';
import { getCost } from './__mocks__/cost';

let sut: SurfaceCostProcessor;

let fileConverter: ShapefileConverterFake;
let puExtractor: PuExtractorFake;
let puValidator: ArePuidsAllowedFake;
let repo: CostSurfaceRepoFake;

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
        provide: ArePuidsAllowedPort,
        useClass: ArePuidsAllowedFake,
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
  puValidator = sandbox.get(ArePuidsAllowedPort);
  repo = sandbox.get(CostSurfacePersistencePort);
});

const scenarioId = v4();

describe(`when shapefile couldn't be converted`, () => {
  beforeEach(() => {
    fileConverter.mock.mockRejectedValue(
      new Error('Its a cat, not a shapefile!'),
    );
  });

  it(`should throw`, async () => {
    await expect(sut.process(getJob(scenarioId))).rejects.toThrow(/a cat/);
  });
});

describe(`when shapefile was converted to geojson`, () => {
  beforeEach(() => {
    fileConverter.mock.mockResolvedValue(getGeoJson());
  });

  describe(`when cost is missing in properties`, () => {
    beforeEach(() => {
      puExtractor.mock.mockImplementationOnce(() => {
        throw new Error(`Missing surface cost properties.`);
      });
    });

    it(`should throw`, async () => {
      await expect(sut.process(getJob(scenarioId))).rejects.toThrow(/Missing/);
      expect(puExtractor.mock).toHaveBeenCalledWith(getGeoJson());
    });
  });

  describe(`when cost was resolved`, () => {
    beforeEach(() => {
      puExtractor.mock.mockReturnValue(getCost());
    });

    describe(`when provided PUs do not belong to given scenario`, () => {
      beforeEach(() => {
        puValidator.mock.mockResolvedValue({
          errors: ['You shall not pass!'],
        });
      });

      it(`should throw`, async () => {
        await expect(sut.process(getJob(scenarioId))).rejects.toThrow(
          /shall not/,
        );
        expect(puValidator.mock).toHaveBeenCalledWith(
          scenarioId,
          getCost().map((c) => c.planningUnitId),
        );
      });
    });

    describe(`when provided PUs belong to given scenario`, () => {
      beforeEach(() => {
        puValidator.mock.mockResolvedValue({
          errors: [],
        });
      });

      it(`should persist the results`, async () => {
        expect(await sut.process(getJob(scenarioId))).toEqual(true);
        expect(repo.saveMock).toHaveBeenCalledWith(scenarioId, getCost());
      });
    });
  });
});
