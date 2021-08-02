export interface UseGeoJSONLayer {
  cache?: number;
  id: string;
  active?: boolean;
  data: Record<string, unknown>;
}
export interface UseAdminPreviewLayer {
  cache?: number;
  active?: boolean;
  bbox?: number[];
  country?: string;
  region?: string;
  subregion?: string;
  search?: string;
}

export interface UsePUGridPreviewLayer {
  cache?: number;
  active?: boolean;
  bbox?: number[] | unknown;
  planningUnitGridShape?: string;
  planningUnitAreakm2?: number;
}

export interface UseWDPAPreviewLayer {
  cache?: number;
  active?: boolean;
  bbox?: number[] | unknown;
  wdpaIucnCategories?: string[];
}

export interface UsePUGridLayer {
  cache?: number;
  sid?: string;
  active?: boolean;
  type: 'default' | 'protected-areas' | 'features' | 'analysis' | 'solutions';
  subtype: 'protected-areas-preview' | 'protected-areas-percentage' | 'gap-analysis' | 'cost-surface' | 'adjust-planning-units';
  options?: Record<string, unknown>;
}
