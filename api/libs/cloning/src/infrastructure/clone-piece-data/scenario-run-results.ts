export const scenarioRunResultsRelativePath = {
  scenarioImport: `scenario-run-results.json`,
  projectImport: (oldScenarioId: string) =>
    `scenarios/${oldScenarioId}/scenario-run-results.json`,
};
