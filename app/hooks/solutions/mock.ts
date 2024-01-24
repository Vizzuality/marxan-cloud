import { Solution } from 'types/api/solution';

const ITEMS: Solution[] = [
  {
    id: '1',
    type: 'solutions',
    runId: 1,
    scoreValue: 5,
    costValue: 100,
    planningUnits: 10,
    missingValues: 0,
  },
  {
    id: '2',
    type: 'solutions',
    runId: 2,
    scoreValue: 10,
    costValue: 10,
    planningUnits: 1,
    missingValues: 30,
  },
  {
    id: '3',
    type: 'solutions',
    runId: 3,
    scoreValue: 3,
    costValue: 13,
    planningUnits: 3,
    missingValues: 3,
  },
];

export default ITEMS;
