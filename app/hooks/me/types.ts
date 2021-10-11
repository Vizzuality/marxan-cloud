import { AxiosRequestConfig } from 'axios';

export interface UseSaveMeProps {
  requestConfig?: AxiosRequestConfig
}

export interface SaveMeProps {
  data: any
}

export interface UseSaveMePasswordProps {
  requestConfig?: AxiosRequestConfig
}

export interface SaveMePasswordProps {
  data: any
}
export interface UseDeleteMeProps {
  requestConfig?: AxiosRequestConfig
}
export interface UseResetPasswordProps {
  requestConfig?: AxiosRequestConfig
}

export interface ResetPasswordProps {
  data: any
}
