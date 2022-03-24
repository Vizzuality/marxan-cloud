import { PlanningUnitGridShape } from '../../../../scenarios-planning-unit/src';

export type PlanningAreaCustomContent = {
  planningAreaGeom: number[];
  puGridShape: PlanningUnitGridShape;
  puAreaKm2: number;
};

export const planningAreaCustomRelativePath = 'planning-area.json';
