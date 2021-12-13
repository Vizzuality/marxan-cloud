import { AxiosRequestConfig } from 'axios';

export interface UseSaveMeProps {
  requestConfig?: AxiosRequestConfig
}

export interface SaveMeProps {
  data: unknown;
}

export interface UseSaveMePasswordProps {
  requestConfig?: AxiosRequestConfig
}

export interface SaveMePasswordProps {
  data: unknown;
}
export interface UseDeleteMeProps {
  requestConfig?: AxiosRequestConfig
}

export interface UseRequestRecoverPasswordProps {
  requestConfig?: AxiosRequestConfig
}
export interface RequestRecoverPasswordProps {
  data: unknown;
}
export interface UseResetPasswordProps {
  requestConfig?: AxiosRequestConfig
  resetToken: string | string[];
}
export interface ResetPasswordProps {
  data: unknown;
}
