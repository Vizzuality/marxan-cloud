import { ScenarioFeaturesData } from '@marxan/features';
import { EntityManager, Repository } from 'typeorm';
import { Test } from '@nestjs/testing';
import { getEntityManagerToken, getRepositoryToken } from '@nestjs/typeorm';
import { DbConnections } from '@marxan-api/ormconfig.connections';

import {
  ScenarioFeaturesDataForSpecDat,
  SpecDatService,
} from './spec.dat.service';
import { v4 } from 'uuid';

let sut: SpecDatService;
let dataRepo: jest.Mocked<Repository<ScenarioFeaturesData>>;
let fakeApiDbEntityManager: FakeEntityManager;

const mockFeatureZero = {
  featureId: 0,
  name: 'Feature Zero',
  apiFeatureId: '00000000-0000-0000-0000-000000000000',
};

const mockFeatureOne = {
  featureId: 1,
  name: 'Feature One',
  apiFeatureId: '11111111-1111-1111-1111-111111111111',
};

beforeEach(async () => {
  const token = getRepositoryToken(
    ScenarioFeaturesData,
    DbConnections.geoprocessingDB,
  );
  const apiDbEntityManagerToken = getEntityManagerToken(DbConnections.default);
  const sandbox = await Test.createTestingModule({
    providers: [
      SpecDatService,
      {
        provide: token,
        useValue: {
          query: jest.fn(),
        } as any,
      },
      {
        provide: apiDbEntityManagerToken,
        useClass: FakeEntityManager,
      },
    ],
  }).compile();

  sut = sandbox.get(SpecDatService);
  dataRepo = sandbox.get(token);
  fakeApiDbEntityManager = sandbox.get(
    apiDbEntityManagerToken,
  ) as FakeEntityManager;
});

describe(`when there are no rows`, () => {
  beforeEach(() => {
    dataRepo.query.mockImplementationOnce(async () => []);
  });

  it(`should return headers only`, async () => {
    expect(await sut.getSpecDatContent('scenario-id')).toEqual(
      `id\ttarget\tprop\tspf\ttarget2\ttargetocc\tname\tsepnum\tsepdistance`,
    );
  });
});
describe(`when there is data available`, () => {
  beforeEach(() => {
    fakeApiDbEntityManager.data = [mockFeatureZero, mockFeatureOne];
    dataRepo.query.mockImplementationOnce(async () => [
      {
        scenarioId: 'id',
        featureId: 0,
        fpf: 0.33,
        featureDataId: mockFeatureZero.apiFeatureId,
        prop: 0.25,
        name: 'FeatureZero',
      } as ScenarioFeaturesData,
      {
        scenarioId: 'id',
        featureId: 1,
        fpf: 1.66,
        featureDataId: mockFeatureOne.apiFeatureId,
        prop: 0.25,
        target: 30,
        target2: 32,
        sepNum: 10,
        targetocc: 999,
        name: 'FeatureOne',
        metadata: {
          sepdistance: 4000,
        },
      } as ScenarioFeaturesData,
    ]);
  });

  it(`should return content with omitted not fully filled columns`, async () => {
    expect(await sut.getSpecDatContent('scenario-id')).toMatchInlineSnapshot(`
      "id	target	prop	spf	name
      0	0.00	0.25	0.33	FeatureZero
      1	30.00	0.25	1.66	FeatureOne"
    `);
  });
});

describe(`when there is data available`, () => {
  beforeEach(() => {
    fakeApiDbEntityManager.data = [mockFeatureOne];

    dataRepo.query.mockImplementationOnce(async () => [
      {
        scenarioId: 'id',
        featureId: 1,
        fpf: 1.66,
        featureDataId: mockFeatureOne.apiFeatureId,
        prop: 0.25,
        target: 30,
        target2: 32,
        sepNum: 10,
        targetocc: 999,
        name: 'FeatureOne',
        metadata: {
          sepdistance: 4000,
        },
      } as ScenarioFeaturesData,
    ]);
  });

  it(`should return content`, async () => {
    expect(await sut.getSpecDatContent('scenario-id')).toMatchInlineSnapshot(`
      "id	target	prop	spf	target2	targetocc	name	sepnum	sepdistance
      1	30.00	0.25	1.66	32.00	999.00	FeatureOne	10.00	4000.00"
    `);
  });
});

class FakeEntityManager {
  public data: ScenarioFeaturesDataForSpecDat[] = [];

  createQueryBuilder = () => this;
  select = () => this;
  from = () => this;
  where = () => this;
  async execute() {
    return this.data;
  }
}
