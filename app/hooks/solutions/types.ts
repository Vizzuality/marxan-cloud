import { AxiosRequestConfig } from 'axios';

export interface UseSolutionsOptionsProps {
  search?: string;
  sort?: string;
  filters?: Record<string, unknown>;
  'page[size]'?: number;
  'page[number]'?: number;
  disablePagination?: boolean;
}

export interface UseDownloadScenarioSolutionsProps {
  requestConfig?: AxiosRequestConfig;
}
