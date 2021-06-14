import { AxiosRequestConfig } from 'axios';

export interface UseOrganizationsOptionsProps {
  search?: string;
  sort?: string;
  filters?: Record<string, unknown>
}

export interface UseSaveOrganizationProps {
  requestConfig?: AxiosRequestConfig
}

export interface SaveOrganizationProps {
  id?: string,
  data: any
}

export interface UseDeleteOrganizationProps {
  requestConfig?: AxiosRequestConfig
}

export interface DeleteOrganizationProps {
  id: string
}
