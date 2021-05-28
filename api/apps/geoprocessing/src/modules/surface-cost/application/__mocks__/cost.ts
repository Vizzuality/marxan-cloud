import { PlanningUnitCost } from '../../ports/planning-unit-cost';

export const getCost = (): PlanningUnitCost[] => [
  {
    cost: 200,
    planningUnitId: `puid-1`,
  },
  {
    cost: 400,
    planningUnitId: `puid-2`,
  },
];
