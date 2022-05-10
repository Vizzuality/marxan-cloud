export const scenarioRunResultsRelativePath = `scenario-run-results.json`;

export type BlmResultsContent = {
  cost: number;
  blmValue: number;
  boundaryLength: number;
  png?: number[];
};
export type MarxanRunResultsContent = {
  includedCount: number;
  values: boolean[];
  puid: number;
};

export type OutputScenarioSummary = {
  runId?: number;
  scoreValue?: number;
  costValue?: number;
  planningUnits?: number;
  connectivity?: number;
  connectivityTotal?: number;
  mpm?: number;
  penaltyValue?: number;
  shortfall?: number;
  missingValues?: number;
  metadata?: Record<string, unknown>;
  best?: boolean;
  distinctFive?: boolean;
};

export type ScenarioRunResultsContent = {
  blmResults: BlmResultsContent[];
  marxanRunResults: MarxanRunResultsContent[];
  outputSummaries: OutputScenarioSummary[];
};
