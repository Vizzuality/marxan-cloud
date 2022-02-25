import { PlanningUnitGridShape } from '../../../../scenarios-planning-unit/src';

export interface PlanningAreaCustomContent {
  planningAreaGeom: number[];
  puGridShape: PlanningUnitGridShape;
  puAreaKm2: number;
}

export const PlanningAreaCustomRelativePath = 'planning-area.json';
export const PlanningAreaCustomGeoJSONRelativePath =
  'planning-area/project-pa.geojson';
