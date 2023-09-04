import { AxiosRequestConfig } from 'axios';

export interface UseScenariosOptionsProps {
  search?: string;
  sort?: string;
  filters?: Record<string, unknown>;
}

export interface UseDeleteScenarioProps {
  requestConfig?: AxiosRequestConfig;
}

export interface DeleteScenarioProps {
  id: string;
}

export interface UseSaveScenarioLockProps {
  requestConfig?: AxiosRequestConfig;
}

export interface SaveScenarioLockProps {
  sid?: string;
}

export interface UseDeleteScenarioLockProps {
  requestConfig?: AxiosRequestConfig;
}

export interface DeleteScenarioLockProps {
  sid?: string;
}

export interface UseUploadScenarioPUProps {
  requestConfig?: AxiosRequestConfig;
}

export interface UploadScenarioPUProps {
  id?: string;
  data: FormData;
}

export interface UseUploadScenarioCostSurfaceProps {
  requestConfig?: AxiosRequestConfig;
}

export interface UploadScenarioCostSurfaceProps {
  id?: string;
  data: any;
}

export interface UseSaveScenarioPUProps {
  requestConfig?: AxiosRequestConfig;
}

export interface SaveScenarioPUProps {
  id?: string;
  data: any;
}

// useUploadPA
export interface UseUploadPAProps {
  requestConfig?: AxiosRequestConfig;
}
export interface UploadPAProps {
  id?: string;
  data: any;
}

// useDuplicateScenario
export interface UseDuplicateScenarioProps {
  requestConfig?: AxiosRequestConfig;
}

export interface DuplicateScenarioProps {
  sid: string | string[];
}

export interface UseCancelRunScenarioProps {
  requestConfig?: AxiosRequestConfig;
}

export interface CancelRunScenarioProps {
  id: string | string[];
}

// useSaveScenarioCalibrationRange
export interface UseSaveScenarioCalibrationRangeProps {
  requestConfig?: AxiosRequestConfig;
}
export interface SaveScenarioCalibrationRangeProps {
  sid?: string;
  data: any;
}

export interface UseDownloadScenarioReportProps {
  requestConfig?: AxiosRequestConfig;
  projectName: string;
  scenarioName: string;
  runId: number | string;
}

export interface DownloadScenarioReportProps {
  sid: string;
  solutionId: string;
}

export interface UseBlmImageProps {
  [q: string]: any;
}

export type PlanningUnitState = 'available' | 'locked-in' | 'locked-out';

export interface ScenarioPlanningUnit {
  id: string;
  defaultStatus: PlanningUnitState;
  inclusionStatus: PlanningUnitState;
  setByUser: boolean;
}
