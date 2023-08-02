export interface Solution {
  id: string;
  type: 'solutions';
  runId: number;
  scoreValue: number;
  costValue: number;
  missingValues: number;
  planningUnits: number;
}
