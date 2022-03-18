export const scenarioRunResultsRelativePath = {
  scenarioImport: `scenario-run-results.json`,
  projectImport: (oldScenarioId: string) =>
    `scenarios/${oldScenarioId}/scenario-run-results.json`,
};

export interface BlmResultsContent {
  cost: number;
  blmValue: number;
  boundaryLength: number;
}
export interface MarxanRunResultsContent {
  includedCount: number;
  value: boolean[];
  puid: number;
}

export interface ScenarioRunResultsContent {
  blmResults: BlmResultsContent[];
  marxanRunResults: MarxanRunResultsContent[];
}
