import { AxiosRequestConfig } from 'axios';

export interface UseSolutionsOptionsProps {
  search?: string;
  sort?: string;
  filters?: Record<string, unknown>
}

export interface UseDownloadScenarioSolutionsProps {
  requestConfig?: AxiosRequestConfig
}

export interface DownloadScenarioSolutionsProps {
  id?: string,
}
