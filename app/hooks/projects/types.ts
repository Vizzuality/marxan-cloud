import { AxiosRequestConfig } from 'axios';

export interface UseSaveProjectProps {
  requestConfig?: AxiosRequestConfig
}

export interface SaveProjectProps {
  id?: string,
  data: any
}

export interface UseDeleteProjectProps {
  requestConfig?: AxiosRequestConfig
}

export interface DeleteProjectProps {
  id: string
}
