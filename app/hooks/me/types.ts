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
  resetToken: string | string[];
}
export interface ResetPasswordProps {
  data: any
}
export interface UseSignUpConfirmationProps {
  requestConfig?: AxiosRequestConfig
  confirmAccountToken: string | string[];
}

export interface SignUpConfirmationProps {
  data: any
}

export interface UsePasswordChangeConfirmationProps {
  requestConfig?: AxiosRequestConfig
  changePasswordConfirmationToken: string | string[];
}

export interface PasswordChangeConfirmationProps {
  data: any
}
