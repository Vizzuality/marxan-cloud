import { PUWithArea } from '../../ports/available-planning-units/get-available-planning-units';
import { PlanningUnitCost } from '../../ports/planning-unit-cost';

export const getAreaByPlanningUnit = (
  planningUnitsIds: string[],
): PUWithArea[] =>
  planningUnitsIds.map((pu) => ({
    id: pu,
    area: Math.random(),
  }));

// move this to application and use it in surface-cost-processor
export const getCostByAreaOfPlanningUnit = (
  puWithArea: PUWithArea[],
  referenceArea: number,
): PlanningUnitCost[] =>
  puWithArea.map((pu) => ({
    puid: pu.id,
    cost: Math.round((pu.area * 100) / referenceArea) / 100,
  }));
