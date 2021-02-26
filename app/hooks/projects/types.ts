import { AxiosRequestConfig } from 'axios';

export interface UseProjectsProps {
  search?: string;
}

export interface UseSaveProjectProps {
  requestConfig: AxiosRequestConfig
}
