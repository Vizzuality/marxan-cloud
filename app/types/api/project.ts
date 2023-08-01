export interface Project {
  id: string;
  name: string;
  area?: string;
  description?: string;
  contributors?: Record<string, unknown>[];
}

export type PlanningUnit = 'square' | 'hexagon' | 'from_shapefile';

export interface PlanningArea {
  planningUnitGridShape: PlanningUnit;
  planningUnitAreakm2: number;
  country: Object;
  region?: Object;
}

export interface Area {
  planningUnitGridShape?: string;
  planningUnitAreakm2: number;
  countryId: string;
}

export interface Solution {
  id: string;
  runId: number;
  score: number;
  cost: number;
  planningUnits: number;
  missingValues: number;
}
