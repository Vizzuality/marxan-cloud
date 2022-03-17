export const scenarioPlanningUnitsDataRelativePath = {
  scenarioImport: `scenario-pu-data.json`,
  projectImport: (oldScenarioId: string) =>
    `scenarios/${oldScenarioId}/scenario-pu-data.json`,
};

interface PlanningUnitData {
  puid: number;
  cost: number;
  lockinStatus?: 1 | 2;
  xloc?: number;
  yloc?: number;
  protectedArea?: number;
  protectedByDefault: boolean;
  featureList: string[];
}

export interface ScenarioPlanningUnitsDataContent {
  planningUnitsData: PlanningUnitData[];
}
