import { AxiosRequestConfig } from 'axios';

export interface UseFeaturesFiltersProps {
  search?: string;
}

export interface UseSaveFeatureProps {
  requestConfig?: AxiosRequestConfig;
}

export interface SaveFeatureProps {
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
}
