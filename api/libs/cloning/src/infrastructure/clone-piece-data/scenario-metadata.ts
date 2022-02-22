export interface ScenarioMetadataContent {
  name: string;
  description?: string;
}

export interface ScenarioMetadataRelativePathsType {
  scenarioImport: string;
  projectImport(oldScenarioId: string): string;
}

export const ScenarioMetadataRelativePaths: ScenarioMetadataRelativePathsType = {
  scenarioImport: `scenario-metadata.json`,
  projectImport: (oldScenarioId: string) =>
    `scenarios/${oldScenarioId}/scenario-metadata.json`,
};
