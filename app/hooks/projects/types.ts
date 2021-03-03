import { AxiosRequestConfig } from 'axios';

export interface UseSaveProjectProps extends DefaulRequestProps {}

export interface UseDeleteProjectProps extends DefaulRequestProps {}

export interface DefaulRequestProps {
  requestConfig?: AxiosRequestConfig
}
