export const scenarioRunResultsRelativePath = {
  scenarioImport: `scenario-run-results.json`,
  projectImport: (oldScenarioId: string) =>
    `scenarios/${oldScenarioId}/scenario-run-results.json`,
};

export type BlmResultsContent = {
  cost: number;
  blmValue: number;
  boundaryLength: number;
};
export type MarxanRunResultsContent = {
  includedCount: number;
  values: boolean[];
  puid: number;
};

export type ScenarioRunResultsContent = {
  blmResults: BlmResultsContent[];
  marxanRunResults: MarxanRunResultsContent[];
};
