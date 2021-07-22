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
          find: jest.fn(),
        } as any,
      },
    ],
  }).compile();

  sut = sandbox.get(SpecDatService);
  dataRepo = sandbox.get(token);
});

describe(`when there are no rows`, () => {
  beforeEach(() => {
    dataRepo.find.mockImplementationOnce(async () => []);
  });

  it(`should return headers only`, async () => {
    expect(await sut.getSpecDatContent('scenario-id')).toEqual(
      `id\ttarget\tprop\tspf\ttarget2\ttargetocc\tname\tsepnum\tsepdistance\n`,
    );
  });
});
describe(`when there is data available`, () => {
  beforeEach(() => {
    dataRepo.find.mockImplementationOnce(async () => [
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

  it(`should return content`, async () => {
    expect(await sut.getSpecDatContent('scenario-id')).toMatchInlineSnapshot(`
      "id	target	prop	spf	target2	targetocc	name	sepnum	sepdistance
      0	0.00	0.25	0.33		0\t\t\t
      1	30.00	0.25	1.66	32	999		10	4000"
    `);
  });
});
