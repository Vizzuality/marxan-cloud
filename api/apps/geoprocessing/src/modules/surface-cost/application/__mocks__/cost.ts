import { PlanningUnitCost } from '../../ports/planning-unit-cost';

export const getCostByPlanningUnit = (
  planningUnitsIds: string[],
  expectedCost?: number,
): PlanningUnitCost[] =>
  planningUnitsIds.map((pu) => ({
    cost: expectedCost ?? 200,
    puid: pu,
  }));
