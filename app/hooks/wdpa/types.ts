import { AxiosRequestConfig } from 'axios';

export interface UseWDPACategoriesProps {
  adminAreaId?: string;
  customAreaId?: string;
  scenarioId: string[] | string;
}

export interface UseSaveScenarioProtectedAreasProps {
  requestConfig?: AxiosRequestConfig
}

export interface SaveScenarioProtectedAreasProps {
  data: unknown;
  id: string[] | string;
}
