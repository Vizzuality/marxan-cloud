export interface UseAdminPreviewLayer {
  bbox?: number[];
  country?: string;
  region?: string;
  subregion?: string;
  search?: string;
}

export interface UsePUGridPreviewLayer {
  bbox?: number[] | unknown;
  planningUnitGridShape?: string;
  planningUnitAreakm2?: number;
}

export interface UseWDPAPreviewLayer {
  bbox?: number[] | unknown;
  wdpaIucnCategories?: string[];
}
