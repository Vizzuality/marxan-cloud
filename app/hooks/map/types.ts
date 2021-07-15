export interface UseAdminPreviewLayer {
  active?: boolean;
  bbox?: number[];
  country?: string;
  region?: string;
  subregion?: string;
  search?: string;
}

export interface UsePUGridPreviewLayer {
  active?: boolean;
  bbox?: number[] | unknown;
  planningUnitGridShape?: string;
  planningUnitAreakm2?: number;
}

export interface UseWDPAPreviewLayer {
  active?: boolean;
  bbox?: number[] | unknown;
  wdpaIucnCategories?: string[];
}

export interface UsePUGridLayer {
  sid?: string;
  active?: boolean;
  type: 'default' | 'proyected-areas' | 'adjust-planning-units',
  options?: Record<string, unknown>
}
