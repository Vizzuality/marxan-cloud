export interface PUWithArea {
  id: string;
  area: number;
}

export interface PlanningUnitWithPuid {
  id: string;
  puid: number;
}

export abstract class GetAvailablePlanningUnits {
  abstract get(scenarioId: string): Promise<PlanningUnitWithPuid[]>;
}
