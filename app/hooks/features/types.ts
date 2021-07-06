import { AxiosRequestConfig } from 'axios';

export interface UseFeaturesFiltersProps {
  search?: string;
}

export interface UseSaveSelectedFeaturesProps {
  requestConfig?: AxiosRequestConfig
}

export interface SaveSelectedFeaturesProps {
  id?: string,
  data: any
}

export interface UseDeleteFeatureProps {
  requestConfig?: AxiosRequestConfig
}

export interface DeleteFeatureProps {
  id: string
}

export interface UseFeaturesOptionsProps {
  search?: string;
  sort?: string;
  filters?: Record<string, unknown>
}
