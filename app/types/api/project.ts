export interface Project {
  id: string;
  name: string;
  area?: string;
  description?: string;
  contributors?: Record<string, unknown>[];
  bbox?: number[];
  countryId?: string;
  createdAt?: string;
  customProtectedAreas?: Record<string, unknown>[];
  adminAreaLevel1I?: string;
  adminAreaLevel2Id?: string;
  planningAreaId?: string;
  planningUnitAreakm2?: number;
  planningUnitGridShape?: string;
  publicMetadata?: {
    [key: string]: unknown;
  };
  type?: string;
  lastModifiedAt?: string;
  isPublic?: boolean;
  planningArea?: PlanningArea;
  planningAreaName?: string;
  metadata?: {
    [key: string]: unknown;
    cache: number;
  };
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
