export interface Project {
  name: string;
  description: string;
  hasCustomArea: boolean;
  area: PlanningArea;
}

export interface PlanningArea {
  unit: PlanningUnit;
  size: number;
  country: Object;
  region?: Object;
}

export enum PlanningUnit {
  SQUARE = 'square',
  HEXAGON = 'hexagon',
  UPLOAD = 'upload',
}

export enum PlanningUnitAreaSizeUnit {
  KM2 = 'KM2',
  ML2 = 'ML2',
}
