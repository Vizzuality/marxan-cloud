import { AxiosRequestConfig } from 'axios';

export interface UseAdminUsersProps {
  page: number;
  search?: string;
  sort?: Record<string, string>;
  filters?: Record<string, unknown>
}

export interface UseAdminPublishedProjectsProps {
  page: number;
  search?: string;
  sort?: Record<string, string>;
  filters?: Record<string, unknown>
}

export interface UseSaveAdminPublishedProjectProps {
  requestConfig?: AxiosRequestConfig
}

export interface SaveAdminPublishedProjectProps {
  id?: string;
  data?: any;
  status: string;
}
