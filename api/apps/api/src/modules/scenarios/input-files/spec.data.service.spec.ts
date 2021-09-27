import { ScenarioFeaturesData } from '@marxan/features';
import { Repository } from 'typeorm';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DbConnections } from '@marxan-api/ormconfig.connections';

import { SpecDatService } from './spec.dat.service';

let sut: SpecDatService;
let dataRepo: jest.Mocked<Repository<ScenarioFeaturesData>>;

beforeEach(async () => {
  const token = getRepositoryToken(
    ScenarioFeaturesData,
    DbConnections.geoprocessingDB,
  );
  const sandbox = await Test.createTestingModule({
    providers: [
      SpecDatService,
      {
        provide: token,
        useValue: {
          query: jest.fn(),
        } as any,
      },
    ],
  }).compile();

  sut = sandbox.get(SpecDatService);
  dataRepo = sandbox.get(token);
});

describe(`when there are no rows`, () => {
  beforeEach(() => {
    dataRepo.query.mockImplementationOnce(async () => []);
  });

  it(`should return headers only`, async () => {
    expect(await sut.getSpecDatContent('scenario-id')).toEqual(
      `id\ttarget\tprop\tspf\ttarget2\ttargetocc\tsepnum\tsepdistance`,
    );
  });
});
describe(`when there is data available`, () => {
  beforeEach(() => {
    dataRepo.query.mockImplementationOnce(async () => [
      {
        scenarioId: 'id',
        featureId: 0,
        fpf: 0.33,
        featuresDataId: '...',
        prop: 0.25,
      } as ScenarioFeaturesData,
      {
        scenarioId: 'id',
        featureId: 1,
        fpf: 1.66,
        featuresDataId: '...',
        prop: 0.25,
        target: 30,
        target2: 32,
        sepNum: 10,
        targetocc: 999,
        metadata: {
          sepdistance: 4000,
        },
      } as ScenarioFeaturesData,
    ]);
  });

  it(`should return content with omitted not fully filled columns`, async () => {
    expect(await sut.getSpecDatContent('scenario-id')).toMatchInlineSnapshot(`
      "id	target	prop	spf
      0	0.00	0.25	0.33
      1	30.00	0.25	1.66"
    `);
  });
});

describe(`when there is data available`, () => {
  beforeEach(() => {
    dataRepo.query.mockImplementationOnce(async () => [
      {
        scenarioId: 'id',
        featureId: 1,
        fpf: 1.66,
        featuresDataId: '...',
        prop: 0.25,
        target: 30,
        target2: 32,
        sepNum: 10,
        targetocc: 999,
        metadata: {
          sepdistance: 4000,
        },
      } as ScenarioFeaturesData,
    ]);
  });

  it(`should return content`, async () => {
    expect(await sut.getSpecDatContent('scenario-id')).toMatchInlineSnapshot(`
      "id	target	prop	spf	target2	targetocc	sepnum	sepdistance
      1	30.00	0.25	1.66	32.00	999.00	10.00	4000.00"
    `);
  });
});
