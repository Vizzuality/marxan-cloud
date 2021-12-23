import { Test } from '@nestjs/testing';
import {
  ParsedRow,
  ResultRow,
  ResultWithBestSolution,
  ResultWithPUValues,
} from '@marxan/marxan-output';
import { ResultParserService } from './result-parser.service';
import { MostDifferentService } from './most-different.service';
import { BestSolutionService } from '../../adapters-shared/marxan-output-parser/best-solution.service';
import { MarxanOutputParserService } from '../../adapters-shared/marxan-output-parser/marxan-output-parser.service';

let sut: ResultParserService;

beforeEach(async () => {
  const sandbox = await Test.createTestingModule({
    providers: [
      ResultParserService,
      {
        provide: MarxanOutputParserService,
        useValue: { parse: () => parsedRows },
      },
      {
        provide: BestSolutionService,
        useValue: {
          map: (source: ParsedRow[]) =>
            source.map((r) =>
              Object.assign(new ResultWithBestSolution(), {
                ...r,
                best: true,
              }),
            ),
        },
      },
      {
        provide: MostDifferentService,
        useValue: {
          map: (source: ResultWithPUValues[]) =>
            source.map((r) =>
              Object.assign(new ResultRow(), {
                ...r,
                distinctFive: false,
              }),
            ),
        },
      },
    ],
  }).compile();

  sut = sandbox.get(ResultParserService);
});

describe(`given data`, () => {
  it(`should return parsed values`, async () => {
    expect(
      await sut.parse(content, {
        puSelectionState: {},
        puUsageByRun: [],
      }),
    ).toMatchInlineSnapshot(`
      Array [
        ResultRow {
          "best": true,
          "connectivity": 16000,
          "connectivityEdge": 16000,
          "connectivityIn": 0,
          "connectivityInFraction": 0,
          "connectivityOut": 51648000,
          "connectivityTotal": 51664000,
          "cost": 640,
          "distinctFive": false,
          "missingValues": 0,
          "mpm": 1,
          "penalty": 0,
          "planningUnits": 2,
          "puValues": Array [],
          "runId": 1,
          "score": 16640,
          "shortfall": 0,
        },
        ResultRow {
          "best": true,
          "connectivity": 8000,
          "connectivityEdge": 8000,
          "connectivityIn": 0,
          "connectivityInFraction": 0,
          "connectivityOut": 51656000,
          "connectivityTotal": 51664000,
          "cost": 400,
          "distinctFive": false,
          "missingValues": 1,
          "mpm": 0,
          "penalty": 8240,
          "planningUnits": 1,
          "puValues": Array [],
          "runId": 2,
          "score": 16640,
          "shortfall": 0.5,
        },
        ResultRow {
          "best": true,
          "connectivity": 12000,
          "connectivityEdge": 12000,
          "connectivityIn": 2000,
          "connectivityInFraction": 0.0000387117,
          "connectivityOut": 51650000,
          "connectivityTotal": 51664000,
          "cost": 800,
          "distinctFive": false,
          "missingValues": 1,
          "mpm": 0,
          "penalty": 8240,
          "planningUnits": 2,
          "puValues": Array [],
          "runId": 3,
          "score": 21040,
          "shortfall": 0.5,
        },
        ResultRow {
          "best": true,
          "connectivity": 16000,
          "connectivityEdge": 16000,
          "connectivityIn": 0,
          "connectivityInFraction": 0,
          "connectivityOut": 51648000,
          "connectivityTotal": 51664000,
          "cost": 640,
          "distinctFive": false,
          "missingValues": 0,
          "mpm": 1,
          "penalty": 0,
          "planningUnits": 2,
          "puValues": Array [],
          "runId": 4,
          "score": 16640,
          "shortfall": 0,
        },
        ResultRow {
          "best": true,
          "connectivity": 32000,
          "connectivityEdge": 32000,
          "connectivityIn": 4000,
          "connectivityInFraction": 0.0000774234,
          "connectivityOut": 51628000,
          "connectivityTotal": 51664000,
          "cost": 1840,
          "distinctFive": false,
          "missingValues": 0,
          "mpm": 1,
          "penalty": 0,
          "planningUnits": 5,
          "puValues": Array [],
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

const parsedRows = [
  {
    connectivity: 16000,
    connectivityEdge: 16000,
    connectivityIn: 0,
    connectivityInFraction: 0,
    connectivityOut: 51648000,
    connectivityTotal: 51664000,
    cost: 640,
    missingValues: 0,
    mpm: 1,
    penalty: 0,
    planningUnits: 2,
    runId: 1,
    score: 16640,
    shortfall: 0,
  },
  {
    connectivity: 8000,
    connectivityEdge: 8000,
    connectivityIn: 0,
    connectivityInFraction: 0,
    connectivityOut: 51656000,
    connectivityTotal: 51664000,
    cost: 400,
    missingValues: 1,
    mpm: 0,
    penalty: 8240,
    planningUnits: 1,
    runId: 2,
    score: 16640,
    shortfall: 0.5,
  },
  {
    connectivity: 12000,
    connectivityEdge: 12000,
    connectivityIn: 2000,
    connectivityInFraction: 0.0000387117,
    connectivityOut: 51650000,
    connectivityTotal: 51664000,
    cost: 800,
    missingValues: 1,
    mpm: 0,
    penalty: 8240,
    planningUnits: 2,
    runId: 3,
    score: 21040,
    shortfall: 0.5,
  },
  {
    connectivity: 16000,
    connectivityEdge: 16000,
    connectivityIn: 0,
    connectivityInFraction: 0,
    connectivityOut: 51648000,
    connectivityTotal: 51664000,
    cost: 640,
    missingValues: 0,
    mpm: 1,
    penalty: 0,
    planningUnits: 2,
    runId: 4,
    score: 16640,
    shortfall: 0,
  },
  {
    connectivity: 32000,
    connectivityEdge: 32000,
    connectivityIn: 4000,
    connectivityInFraction: 0.0000774234,
    connectivityOut: 51628000,
    connectivityTotal: 51664000,
    cost: 1840,
    missingValues: 0,
    mpm: 1,
    penalty: 0,
    planningUnits: 5,
    runId: 5,
    score: 33840,
    shortfall: 0,
  },
];
