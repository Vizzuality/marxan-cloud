import { PlanningUnitCost } from '../../ports/planning-unit-cost';

export const getCostByPlanningUnit = (
  planningUnitsIds: string[],
  expectedCost?: number,
): PlanningUnitCost[] =>
  planningUnitsIds.map((pu, index) => ({
    cost: expectedCost ?? 200,
    puid: index,
    puUuid: pu,
  }));
