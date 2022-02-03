import { PlanningUnitCost } from '../../ports/planning-unit-cost';

export const getCostByPlanningUnit = (
  planningUnitsIds: string[],
): PlanningUnitCost[] =>
  planningUnitsIds.map((pu, index) => ({
    cost: 200,
    puid: index,
    puUuid: pu,
  }));
