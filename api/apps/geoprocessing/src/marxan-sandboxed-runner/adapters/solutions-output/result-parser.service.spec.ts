import { ResultParserService } from './result-parser.service';
import { Test } from '@nestjs/testing';

let sut: ResultParserService;

beforeEach(async () => {
  const sandbox = await Test.createTestingModule({
    providers: [ResultParserService],
  }).compile();

  sut = sandbox.get(ResultParserService);
});

describe(`given empty content`, () => {
  it(`should return empty array`, () => {
    expect(sut.parse('')).toEqual([]);
  });
});

describe(`given headers only`, () => {
  it(`should return empty array`, () => {
    expect(sut.parse('one,two,three')).toEqual([]);
  });
});

describe(`given invalid data in a row (2.1 planning units)`, () => {
  it(`should throw an error`, () => {
    expect(() =>
      sut.parse(`headers...
1,16640,640,2.1,16000,5.1664e+07,0,16000,5.1648e+07,0,0,0,0,1

    `),
    ).toThrow(
      `Unexpected values in Marxan output at value [0]: [1,16640,640,2.1,16000,5.1664e+07,0,16000,5.1648e+07,0,0,0,0,1]`,
    );
  });
});

describe(`given data`, () => {
  it(`should return parsed values`, () => {
    expect(sut.parse(content)).toMatchInlineSnapshot(`
      Array [
        ResultRow {
          "best": false,
          "connectivity": 16000,
          "connectivityEdge": 16000,
          "connectivityIn": 0,
          "connectivityInFraction": 0,
          "connectivityOut": 51648000,
          "connectivityTotal": 51664000,
          "cost": 640,
          "missingValues": 0,
          "mostDifferent": false,
          "mpm": 1,
          "penalty": 0,
          "planningUnits": 2,
          "runId": 1,
          "score": 16640,
          "shortfall": 0,
        },
        ResultRow {
          "best": false,
          "connectivity": 8000,
          "connectivityEdge": 8000,
          "connectivityIn": 0,
          "connectivityInFraction": 0,
          "connectivityOut": 51656000,
          "connectivityTotal": 51664000,
          "cost": 400,
          "missingValues": 1,
          "mostDifferent": false,
          "mpm": 0,
          "penalty": 8240,
          "planningUnits": 1,
          "runId": 2,
          "score": 16640,
          "shortfall": 0.5,
        },
        ResultRow {
          "best": false,
          "connectivity": 12000,
          "connectivityEdge": 12000,
          "connectivityIn": 2000,
          "connectivityInFraction": 0.0000387117,
          "connectivityOut": 51650000,
          "connectivityTotal": 51664000,
          "cost": 800,
          "missingValues": 1,
          "mostDifferent": false,
          "mpm": 0,
          "penalty": 8240,
          "planningUnits": 2,
          "runId": 3,
          "score": 21040,
          "shortfall": 0.5,
        },
        ResultRow {
          "best": false,
          "connectivity": 16000,
          "connectivityEdge": 16000,
          "connectivityIn": 0,
          "connectivityInFraction": 0,
          "connectivityOut": 51648000,
          "connectivityTotal": 51664000,
          "cost": 640,
          "missingValues": 0,
          "mostDifferent": false,
          "mpm": 1,
          "penalty": 0,
          "planningUnits": 2,
          "runId": 4,
          "score": 16640,
          "shortfall": 0,
        },
        ResultRow {
          "best": false,
          "connectivity": 32000,
          "connectivityEdge": 32000,
          "connectivityIn": 4000,
          "connectivityInFraction": 0.0000774234,
          "connectivityOut": 51628000,
          "connectivityTotal": 51664000,
          "cost": 1840,
          "missingValues": 0,
          "mostDifferent": false,
          "mpm": 1,
          "penalty": 0,
          "planningUnits": 5,
          "runId": 5,
          "score": 33840,
          "shortfall": 0,
        },
      ]
    `);
  });
});

const content = `"Run_Number","Score","Cost","Planning_Units","Connectivity","Connectivity_Total","Connectivity_In","Connectivity_Edge","Connectivity_Out","Connectivity_In_Fraction","Penalty","Shortfall","Missing_Values","MPM"
1,16640,640,2,16000,5.1664e+07,0,16000,5.1648e+07,0,0,0,0,1
2,16640,400,1,8000,5.1664e+07,0,8000,5.1656e+07,0,8240,0.5,1,0
3,21040,800,2,12000,5.1664e+07,2000,12000,5.165e+07,3.87117e-05,8240,0.5,1,0
4,16640,640,2,16000,5.1664e+07,0,16000,5.1648e+07,0,0,0,0,1
5,33840,1840,5,32000,5.1664e+07,4000,32000,5.1628e+07,7.74234e-05,0,0,0,1
`;
