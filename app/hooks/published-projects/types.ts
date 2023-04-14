import { AxiosRequestConfig } from 'axios';

// usePublishedProjects
export interface UsePublishedProjectsProps {
  search?: string;
  sort?: string;
  filters?: Record<string, unknown>;
}

export interface UseDuplicatePublishedProjectProps {
  requestConfig?: AxiosRequestConfig;
}

export interface DuplicatePublishedProjectProps {
  exportId: string;
}
