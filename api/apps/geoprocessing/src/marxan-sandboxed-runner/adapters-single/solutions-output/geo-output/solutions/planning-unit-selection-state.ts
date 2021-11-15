export interface PlanningUnitSelectionState {
  values: boolean[];
  usedCount: number;
}

export type PlanningUnitsSelectionState = Record<
  string,
  PlanningUnitSelectionState
>;
