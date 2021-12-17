export interface PlanningUnitSelectionState {
  values: boolean[];
  usedCount: number;
}

export type PlanningUnitsSelectionState = {
  puSelectionState: Record<string, PlanningUnitSelectionState>;
  puUsageByRun: Array<Array<0 | 1>>;
};
