import { MostDifferentService } from './most-different.service';
import { Test } from '@nestjs/testing';
import { subjectRows } from './__tests__/solutions';

let sut: MostDifferentService;

beforeEach(async () => {
  const sandbox = await Test.createTestingModule({
    providers: [MostDifferentService],
  }).compile();
  sut = sandbox.get(MostDifferentService);
});

describe(`when given result rows`, () => {
  it(`marks those with most different under particular criteria`, () => {
    const output = sut.map(subjectRows);
    expect(output.filter((row) => row.distinctFive).length).toEqual(5);
    expect(output).toMatchInlineSnapshot(`
      Array [
        ResultRow {
          "best": false,
          "connectivity": 0,
          "connectivityEdge": 0,
          "connectivityIn": 0,
          "connectivityInFraction": 0,
          "connectivityOut": 0,
          "connectivityTotal": 0,
          "cost": 5,
          "distinctFive": false,
          "missingValues": 0,
          "mpm": 0,
          "penalty": 0,
          "planningUnits": 4,
          "runId": 1,
          "score": 1000,
          "shortfall": 0,
        },
        ResultRow {
          "best": false,
          "connectivity": 0,
          "connectivityEdge": 0,
          "connectivityIn": 0,
          "connectivityInFraction": 0,
          "connectivityOut": 0,
          "connectivityTotal": 0,
          "cost": 200,
          "distinctFive": true,
          "missingValues": 0,
          "mpm": 0,
          "penalty": 0,
          "planningUnits": 5,
          "runId": 2,
          "score": 2000,
          "shortfall": 0,
        },
        ResultRow {
          "best": false,
          "connectivity": 0,
          "connectivityEdge": 0,
          "connectivityIn": 0,
          "connectivityInFraction": 0,
          "connectivityOut": 0,
          "connectivityTotal": 0,
          "cost": 50,
          "distinctFive": true,
          "missingValues": 0,
          "mpm": 0,
          "penalty": 0,
          "planningUnits": 1,
          "runId": 3,
          "score": 5000,
          "shortfall": 0,
        },
        ResultRow {
          "best": false,
          "connectivity": 0,
          "connectivityEdge": 0,
          "connectivityIn": 0,
          "connectivityInFraction": 0,
          "connectivityOut": 0,
          "connectivityTotal": 0,
          "cost": 50,
          "distinctFive": true,
          "missingValues": 0,
          "mpm": 0,
          "penalty": 0,
          "planningUnits": 14,
          "runId": 4,
          "score": 6000,
          "shortfall": 0,
        },
        ResultRow {
          "best": false,
          "connectivity": 0,
          "connectivityEdge": 0,
          "connectivityIn": 0,
          "connectivityInFraction": 0,
          "connectivityOut": 0,
          "connectivityTotal": 0,
          "cost": 75,
          "distinctFive": true,
          "missingValues": 0,
          "mpm": 0,
          "penalty": 0,
          "planningUnits": 4,
          "runId": 5,
          "score": 15000,
          "shortfall": 0,
        },
        ResultRow {
          "best": false,
          "connectivity": 0,
          "connectivityEdge": 0,
          "connectivityIn": 0,
          "connectivityInFraction": 0,
          "connectivityOut": 0,
          "connectivityTotal": 0,
          "cost": 95,
          "distinctFive": false,
          "missingValues": 0,
          "mpm": 0,
          "penalty": 0,
          "planningUnits": 4,
          "runId": 6,
          "score": 2000,
          "shortfall": 0,
        },
        ResultRow {
          "best": false,
          "connectivity": 0,
          "connectivityEdge": 0,
          "connectivityIn": 0,
          "connectivityInFraction": 0,
          "connectivityOut": 0,
          "connectivityTotal": 0,
          "cost": 5,
          "distinctFive": true,
          "missingValues": 0,
          "mpm": 0,
          "penalty": 0,
          "planningUnits": 4,
          "runId": 7,
          "score": 10,
          "shortfall": 0,
        },
      ]
    `);
  });
});
