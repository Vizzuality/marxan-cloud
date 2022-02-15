import { PlanningUnitGridShape } from '../../../../scenarios-planning-unit/src';

export interface PlanningAreaGadmContent {
  country: string;
  l1?: string;
  l2?: string;
  puGridShape: PlanningUnitGridShape;
  planningUnitAreakm2: number;
  bbox: number[];
}

export interface PlanningAreaGadmRelativePathsType {
  paGadm: string;
}

export const PlanningAreaGadmRelativePaths: PlanningAreaGadmRelativePathsType = {
  paGadm: 'planning-area.json',
};
