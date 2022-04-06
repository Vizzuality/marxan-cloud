export const scenarioProtectedAreasRelativePath = `scenario-protected-areas.json`;

export type ScenarioProtectedAreasContent = {
  wdpa: number[];
  customProtectedAreas: {
    name: string;
    geom: number[];
  }[];
  threshold?: number;
};
