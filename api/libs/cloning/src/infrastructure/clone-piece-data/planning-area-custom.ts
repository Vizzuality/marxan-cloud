import { PlanningUnitGridShape } from '../../../../scenarios-planning-unit/src';

export interface PlanningAreaCustomContent {
  planningAreaGeom: number[];
  puGridShape: PlanningUnitGridShape;
  puAreaKm2: number;
}

export const planningAreaCustomRelativePath = 'planning-area.json';
export const planningAreaCustomGeoJSONRelativePath =
  'planning-area/project-pa.geojson';
