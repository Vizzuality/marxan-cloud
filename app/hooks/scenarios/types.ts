import { AxiosRequestConfig } from 'axios';

export interface UseScenariosOptionsProps {
  search?: string;
  sort?: string;
  filters?: Record<string, unknown>
}

export interface UseSaveScenarioProps {
  requestConfig?: AxiosRequestConfig
}

export interface SaveScenarioProps {
  id?: string,
  data: any
}

export interface UseDeleteScenarioProps {
  requestConfig?: AxiosRequestConfig
}

export interface DeleteScenarioProps {
  id: string
}

export interface UseUploadScenarioPUProps {
  requestConfig?: AxiosRequestConfig
}

export interface UploadScenarioPUProps {
  id?: string,
  data: any,
}
export interface UseDownloadScenarioCostSurfaceProps {
  requestConfig?: AxiosRequestConfig
}

export interface DownloadScenarioCostSurfaceProps {
  id?: string,
}

export interface UseUploadScenarioCostSurfaceProps {
  requestConfig?: AxiosRequestConfig
}

export interface UploadScenarioCostSurfaceProps {
  id?: string,
  data: any,
}

// useUploadProtectedArea
export interface UseUploadProtectedAreaProps {
  requestConfig?: AxiosRequestConfig
}
export interface UploadProtectedAreaProps {
  id?: any,
  data: any,
}
