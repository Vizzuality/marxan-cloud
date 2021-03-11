import { AxiosRequestConfig } from 'axios';

export interface UseSaveMeProps {
  requestConfig?: AxiosRequestConfig
}

export interface SaveMeProps {
  data: any
}

export interface UseDeleteMeProps {
  requestConfig: AxiosRequestConfig
}
