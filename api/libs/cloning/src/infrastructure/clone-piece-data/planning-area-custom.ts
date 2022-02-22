export interface PlanningAreaCustomContent {
  planningAreaGeom: number[];
}

export interface PlanningAreaCustomRelativePathsType {
  planningArea: string;
  customPaGeoJson: string;
}

export const PlanningAreaCustomRelativePaths: PlanningAreaCustomRelativePathsType = {
  planningArea: 'planning-area.json',
  customPaGeoJson: 'planning-area/project-pa.geojson',
};
