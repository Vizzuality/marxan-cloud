import { AxiosRequestConfig } from 'axios';

export interface UseSaveScenarioProps {
  requestConfig?: AxiosRequestConfig
}

export interface SaveScenarioProps {
  id?: string,
  data: any
}

export interface UseDeleteScenarioProps {
  requestConfig: AxiosRequestConfig
}

export interface DeleteScenarioProps {
  id: string
}
