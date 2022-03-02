export interface ScenarioMetadataContent {
  name: string;
  description?: string;
}

export const scenarioMetadataRelativePath = {
  scenarioImport: `scenario-metadata.json`,
  projectImport: (oldScenarioId: string) =>
    `scenarios/${oldScenarioId}/scenario-metadata.json`,
};
