export interface PlanningUnitState {
  values: boolean[];
  usedCount: number;
}

export type PlanningUnitsState = Record<string, PlanningUnitState>;
