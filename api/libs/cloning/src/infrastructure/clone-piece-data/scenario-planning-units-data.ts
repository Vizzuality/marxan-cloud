export const scenarioPlanningUnitsDataRelativePath = `scenario-pu-data.json`;

type PlanningUnitData = {
  puid: number;
  cost: number;
  lockinStatus?: 1 | 2;
  xloc?: number;
  yloc?: number;
  protectedArea?: number;
  protectedByDefault: boolean;
  featureList: string[];
};

export type ScenarioPlanningUnitsDataContent = {
  planningUnitsData: PlanningUnitData[];
};
