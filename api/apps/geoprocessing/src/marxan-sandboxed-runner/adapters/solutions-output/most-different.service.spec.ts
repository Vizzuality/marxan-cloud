import { ResultRow } from '@marxan/marxan-output';
import { MostDifferentService } from './most-different.service';
import { Test } from '@nestjs/testing';

let sut: MostDifferentService;

beforeEach(async () => {
  const sandbox = await Test.createTestingModule({
    providers: [MostDifferentService],
  }).compile();
  sut = sandbox.get(MostDifferentService);
});

describe(`when given result rows`, () => {
  it(`marks those with most different under particular criteria`, () => {
    expect(sut.map(subjectRows)).toMatchInlineSnapshot(`
      Array [
        Object {
          "best": false,
          "connectivity": 0,
          "connectivityEdge": 0,
          "connectivityIn": 0,
          "connectivityInFraction": 0,
          "connectivityOut": 0,
          "connectivityTotal": 0,
          "cost": 5,
          "missingValues": 0,
          "mostDifferent": true,
          "mpm": 0,
          "penalty": 0,
          "planningUnits": 4,
          "runId": 1,
          "score": 1000,
          "shortfall": 0,
        },
        Object {
          "best": false,
          "connectivity": 0,
          "connectivityEdge": 0,
          "connectivityIn": 0,
          "connectivityInFraction": 0,
          "connectivityOut": 0,
          "connectivityTotal": 0,
          "cost": 200,
          "missingValues": 0,
          "mostDifferent": true,
          "mpm": 0,
          "penalty": 0,
          "planningUnits": 5,
          "runId": 2,
          "score": 1000,
          "shortfall": 0,
        },
        Object {
          "best": false,
          "connectivity": 0,
          "connectivityEdge": 0,
          "connectivityIn": 0,
          "connectivityInFraction": 0,
          "connectivityOut": 0,
          "connectivityTotal": 0,
          "cost": 50,
          "missingValues": 0,
          "mostDifferent": false,
          "mpm": 0,
          "penalty": 0,
          "planningUnits": 1,
          "runId": 3,
          "score": 1000,
          "shortfall": 0,
        },
        Object {
          "best": false,
          "connectivity": 0,
          "connectivityEdge": 0,
          "connectivityIn": 0,
          "connectivityInFraction": 0,
          "connectivityOut": 0,
          "connectivityTotal": 0,
          "cost": 50,
          "missingValues": 0,
          "mostDifferent": true,
          "mpm": 0,
          "penalty": 0,
          "planningUnits": 14,
          "runId": 4,
          "score": 1000,
          "shortfall": 0,
        },
        Object {
          "best": false,
          "connectivity": 0,
          "connectivityEdge": 0,
          "connectivityIn": 0,
          "connectivityInFraction": 0,
          "connectivityOut": 0,
          "connectivityTotal": 0,
          "cost": 75,
          "missingValues": 0,
          "mostDifferent": false,
          "mpm": 0,
          "penalty": 0,
          "planningUnits": 4,
          "runId": 5,
          "score": 1000,
          "shortfall": 0,
        },
        Object {
          "best": false,
          "connectivity": 0,
          "connectivityEdge": 0,
          "connectivityIn": 0,
          "connectivityInFraction": 0,
          "connectivityOut": 0,
          "connectivityTotal": 0,
          "cost": 95,
          "missingValues": 0,
          "mostDifferent": false,
          "mpm": 0,
          "penalty": 0,
          "planningUnits": 4,
          "runId": 6,
          "score": 1400,
          "shortfall": 0,
        },
      ]
    `);
  });
});

const defaults = (): Omit<
  ResultRow,
  'runId' | 'score' | 'cost' | 'planningUnits'
> => ({
  connectivity: 0,
  connectivityTotal: 0,
  connectivityIn: 0,
  connectivityEdge: 0,
  connectivityOut: 0,
  connectivityInFraction: 0,
  penalty: 0,
  shortfall: 0,
  missingValues: 0,
  mpm: 0,
  best: false,
  mostDifferent: false,
});

const subjectRows: ResultRow[] = [
  {
    runId: 1,
    score: 1000,
    cost: 5,
    planningUnits: 4,
    ...defaults(),
  },
  {
    runId: 2,
    score: 1000,
    cost: 200,
    planningUnits: 5,
    ...defaults(),
  },
  {
    runId: 3,
    score: 1000,
    cost: 50,
    planningUnits: 1,
    ...defaults(),
  },
  {
    runId: 4,
    score: 1000,
    cost: 50,
    planningUnits: 14,
    ...defaults(),
  },
  {
    runId: 5,
    score: 1000,
    cost: 75,
    planningUnits: 4,
    ...defaults(),
  },
  {
    runId: 6,
    score: 1400,
    cost: 95,
    planningUnits: 4,
    ...defaults(),
  },
];
