import { AxiosRequestConfig } from 'axios';

export interface UseFeaturesFiltersProps {
  search?: string;
  sort?: string;
  tag?: string;
}

export interface UseSaveSelectedFeaturesProps {
  requestConfig?: AxiosRequestConfig;
}

export interface SaveSelectedFeaturesProps {
  id?: string;
  data: any;
}

export interface UseDeleteFeatureProps {
  requestConfig?: AxiosRequestConfig;
}

export interface DeleteFeatureProps {
  id: string;
}

export interface UseFeaturesOptionsProps {
  search?: string;
  sort?: string;
  filters?: Record<string, unknown>;
  disablePagination?: boolean;
  includeInProgress?: boolean;
}
