import { PlanningUnitGridShape } from '../../../../scenarios-planning-unit/src';

export interface PlanningAreaCustomContent {
  planningAreaGeom: number[];
  puGridShape: PlanningUnitGridShape;
  puAreaKm2: number;
}

export interface PlanningAreaCustomRelativePathsType {
  planningArea: string;
  customPaGeoJson: string;
}

export const PlanningAreaCustomRelativePaths: PlanningAreaCustomRelativePathsType = {
  planningArea: 'planning-area.json',
  customPaGeoJson: 'planning-area/project-pa.geojson',
};
