export const scenarioProtectedAreasRelativePath = {
  scenarioImport: `scenario-protected-areas.json`,
  projectImport: (oldScenarioId: string) =>
    `scenarios/${oldScenarioId}/scenario-protected-areas.json`,
};

export type ScenarioProtectedAreasContent = {
  wdpa: number[];
  customProtectedAreas: {
    name: string;
    geom: number[];
  }[];
  threshold?: number;
};
