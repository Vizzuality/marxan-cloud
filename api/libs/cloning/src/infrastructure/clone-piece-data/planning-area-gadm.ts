import { PlanningUnitGridShape } from '../../../../scenarios-planning-unit/src';

export type PlanningAreaGadmContent = {
  country?: string;
  l1?: string;
  l2?: string;
  puGridShape: PlanningUnitGridShape;
  planningUnitAreakm2: number;
  bbox: number[];
};

export const planningAreaGadmRelativePath = 'planning-area.json';
