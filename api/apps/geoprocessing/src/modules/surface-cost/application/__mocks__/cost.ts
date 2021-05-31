import { PlanningUnitCost } from '../../ports/planning-unit-cost';

export const getCost = (planningUnitsIds: string[]): PlanningUnitCost[] =>
  planningUnitsIds.map((pu) => ({
    cost: 200,
    planningUnitId: pu,
  }));
