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

export interface UseSaveScenarioLockProps {
  requestConfig?: AxiosRequestConfig
}

export interface SaveScenarioLockProps {
  sid?: string
}

export interface UseDeleteScenarioLockProps {
  requestConfig?: AxiosRequestConfig
}

export interface DeleteScenarioLockProps {
  sid?: string,
}

export interface UseUploadScenarioPUProps {
  requestConfig?: AxiosRequestConfig
}

export interface UploadScenarioPUProps {
  id?: string,
  data: FormData,
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

export interface UseSaveScenarioPUProps {
  requestConfig?: AxiosRequestConfig
}

export interface SaveScenarioPUProps {
  id?: string,
  data: any
}

// useUploadPA
export interface UseUploadPAProps {
  requestConfig?: AxiosRequestConfig
}
export interface UploadPAProps {
  id?: string,
  data: any,
}

// useDuplicateScenario
export interface UseDuplicateScenarioProps {
  requestConfig?: AxiosRequestConfig
}

export interface DuplicateScenarioProps {
  sid: string | string[];
}

export interface UseRunScenarioProps {
  requestConfig?: AxiosRequestConfig
}

export interface RunScenarioProps {
  id: string | string[];
}

export interface UseCancelRunScenarioProps {
  requestConfig?: AxiosRequestConfig
}

export interface CancelRunScenarioProps {
  id: string | string[];
}

// useSaveScenarioCalibrationRange
export interface UseSaveScenarioCalibrationRangeProps {
  requestConfig?: AxiosRequestConfig
}
export interface SaveScenarioCalibrationRangeProps {
  sid?: string,
  data: any,
}

export interface UseDownloadScenarioReportProps {
  requestConfig?: AxiosRequestConfig
}

export interface DownloadScenarioReportProps {
  sid: string,
  solutionId: string;
}

export interface UseBlmImageProps {
  [q: string]: any;
}
