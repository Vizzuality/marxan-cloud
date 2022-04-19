import { AxiosRequestConfig } from 'axios';

export interface UseAdminUsersProps {
  page: number;
  search?: string;
  sort?: Record<string, string>;
  filters?: Record<string, unknown>
}

export interface UseSaveBlockUserProps {
  requestConfig?: AxiosRequestConfig
}

export interface SaveBlockUserProps {
  uid?: string;
}

export interface UseDeleteBlockUserProps {
  requestConfig?: AxiosRequestConfig
}

export interface DeleteBlockUserProps {
  uid?: string;
}

export interface UseSaveAdminUserProps {
  requestConfig?: AxiosRequestConfig
}

export interface SaveAdminUserProps {
  uid?: string;
}

export interface UseDeleteAdminUserProps {
  requestConfig?: AxiosRequestConfig
}

export interface DeleteAdminUserProps {
  uid?: string;
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
