import { PUWithArea } from '../../ports/available-planning-units/get-available-planning-units';
import { PlanningUnitCost } from '../../ports/planning-unit-cost';

export const getAreaByPlanningUnit = (
  planningUnitsIds: string[],
): PUWithArea[] =>
  planningUnitsIds.map((pu) => ({
    id: pu,
    area: Math.random(),
  }));

export const getCostByAreaOfPlanningUnit = (
  puWithArea: PUWithArea[],
): PlanningUnitCost[] =>
  puWithArea.map((pu) => ({
    id: pu.id,
    cost: pu.area,
  }));
