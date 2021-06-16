export interface Project {
  name: string;
  description: string;
  hasCustomArea: boolean;
  area: PlanningArea;
}

export interface PlanningArea {
  planningUnitGridShape: PlanningUnit;
  planningUnitAreakm2: number;
  country: Object;
  region?: Object;
}

export enum PlanningUnit {
  SQUARE = 'square',
  HEXAGON = 'hexagon',
}

export enum PlanningUnitAreaSizeUnit {
  KM2 = 'KM2',
  ML2 = 'ML2',
}

export interface Area {
  planningUnitGridShape?: string;
  planningUnitAreakm2: number;
  countryId: string;
}

export interface Solution {
  id: string;
  run: number;
  score: number;
  cost: number;
  planningUnits: number;
  missingValues: number;
}
