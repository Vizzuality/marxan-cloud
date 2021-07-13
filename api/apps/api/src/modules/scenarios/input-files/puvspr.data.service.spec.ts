import { Repository } from 'typeorm';
import { ScenarioPuvsprGeoEntity } from '@marxan/scenario-puvspr';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test } from '@nestjs/testing';
import { DbConnections } from '@marxan-api/ormconfig.connections';

import { PuvsprDatService } from './puvspr.dat.service';

let sut: PuvsprDatService;
let dataRepo: jest.Mocked<Repository<ScenarioPuvsprGeoEntity>>;

beforeEach(async () => {
  const token = getRepositoryToken(
    ScenarioPuvsprGeoEntity,
    DbConnections.geoprocessingDB,
  );
  const sandbox = await Test.createTestingModule({
    providers: [
      PuvsprDatService,
      {
        provide: token,
        useValue: {
          find: jest.fn(),
        } as any,
      },
    ],
  }).compile();

  sut = sandbox.get(PuvsprDatService);
  dataRepo = sandbox.get(token);
});

describe(`when there are no rows`, () => {
  beforeEach(() => {
    dataRepo.find.mockImplementationOnce(async () => []);
  });

  it(`should return headers only`, async () => {
    expect(await sut.getPuvsprDatContent('scenario-id')).toEqual(
      `species\tpu\tamount\n`,
    );
  });
});

describe(`when there is data available`, () => {
  beforeEach(() => {
    dataRepo.find.mockImplementationOnce(async () => [
      {
        amount: 1000.0,
        scenarioId: 'scenarioId',
        featureId: 'feature-1',
        puId: 'pu-1,',
      },
      {
        amount: 0.001,
        scenarioId: 'scenarioId',
        featureId: 'feature-1',
        puId: 'pu-2,',
      },
      {
        amount: 99.995,
        scenarioId: 'scenarioId',
        featureId: 'feature-1',
        puId: 'pu-3,',
      },
    ]);
  });

  it(`should return content`, async () => {
    expect(await sut.getPuvsprDatContent('scenario-id')).toMatchInlineSnapshot(`
      "species	pu	amount
      feature-1	pu-1,	1000.000000
      feature-1	pu-2,	0.001000
      feature-1	pu-3,	99.995000"
    `);
  });
});
