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
  };
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
  FROM_SHAPEFILE = 'from_shapefile',
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
  runId: number;
  score: number;
  cost: number;
  planningUnits: number;
  missingValues: number;
}

export interface ProjectFeature {
  id: string;
  type: 'geo_features';
  description: string;
  propertyName: string;
  isCustom: boolean;
  intersection: unknown;
  featureClassName: string;
  alias: string;
  scenarioUsageCount: number;
  tag?: string;
}
