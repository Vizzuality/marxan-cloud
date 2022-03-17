import { Repository } from 'typeorm';
import { getConnectionToken } from '@nestjs/typeorm';
import { Test } from '@nestjs/testing';
import { DbConnections } from '@marxan-api/ormconfig.connections';

import { PuvsprDatService } from './puvspr.dat.service';

interface PuvsprRow {
  scenarioId: string;
  puId: string;
  featureId: string;
  amount: number;
}

let sut: PuvsprDatService;
let dataRepo: jest.Mocked<Repository<PuvsprRow>>;

beforeEach(async () => {
  const token = getConnectionToken(DbConnections.geoprocessingDB);
  const sandbox = await Test.createTestingModule({
    providers: [
      PuvsprDatService,
      {
        provide: token,
        useValue: {
          query: jest.fn(),
        } as any,
      },
    ],
  }).compile();

  sut = sandbox.get(PuvsprDatService);
  dataRepo = sandbox.get(token);
});

describe(`when there are no rows`, () => {
  beforeEach(() => {
    dataRepo.query.mockImplementationOnce(async () => []);
  });

  it(`should return headers only`, async () => {
    expect(await sut.getPuvsprDatContent('scenario-id')).toEqual(
      `species\tpu\tamount\n`,
    );
  });
});

describe(`when there is data available`, () => {
  beforeEach(() => {
    dataRepo.query.mockImplementationOnce(async () => [
      {
        amount: 1000.0,
        scenario_id: 'scenarioId',
        feature_id: 'feature-1',
        pu_id: 'pu-1,',
      },
      {
        amount: 0.001,
        scenario_id: 'scenarioId',
        feature_id: 'feature-1',
        pu_id: 'pu-2,',
      },
      {
        amount: 99.995,
        scenario_id: 'scenarioId',
        feature_id: 'feature-1',
        pu_id: 'pu-3,',
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
