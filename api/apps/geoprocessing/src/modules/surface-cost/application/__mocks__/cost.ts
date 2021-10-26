import { PlanningUnitCost } from '../../ports/planning-unit-cost';

export const getCostByPlanningUnit = (
  planningUnitsIds: string[],
): PlanningUnitCost[] =>
  planningUnitsIds.map((pu) => ({
    cost: 200,
    puid: pu,
  }));
