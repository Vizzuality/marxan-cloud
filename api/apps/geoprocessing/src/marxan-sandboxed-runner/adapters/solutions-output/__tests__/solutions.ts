import { ResultRow } from '@marxan/marxan-output';

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
  distinctFive: false,
});

export const lowestScoreRunId = 1;
export const secondLowestScoreRunId = 8;

export const subjectRows: ResultRow[] = [
  {
    runId: lowestScoreRunId,
    score: 10,
    cost: 5,
    planningUnits: 4,
    ...defaults(),
  },
  {
    runId: 2,
    score: 1000,
    cost: 5,
    planningUnits: 4,
    ...defaults(),
  },
  {
    runId: 3,
    score: 2000,
    cost: 200,
    planningUnits: 5,
    ...defaults(),
  },
  {
    runId: 4,
    score: 5000,
    cost: 50,
    planningUnits: 1,
    ...defaults(),
  },
  {
    runId: 5,
    score: 6000,
    cost: 50,
    planningUnits: 14,
    ...defaults(),
  },
  {
    runId: 6,
    score: 15000,
    cost: 75,
    planningUnits: 4,
    ...defaults(),
  },
  {
    runId: 7,
    score: 2000,
    cost: 95,
    planningUnits: 4,
    ...defaults(),
  },
  {
    runId: secondLowestScoreRunId,
    score: 10,
    cost: 5,
    planningUnits: 4,
    ...defaults(),
  },
];
