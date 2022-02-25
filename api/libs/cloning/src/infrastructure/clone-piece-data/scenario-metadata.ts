export interface ScenarioMetadataContent {
  name: string;
  description?: string;
}

export const ScenarioMetadataRelativePath = {
  scenarioImport: `scenario-metadata.json`,
  projectImport: (oldScenarioId: string) =>
    `scenarios/${oldScenarioId}/scenario-metadata.json`,
};
