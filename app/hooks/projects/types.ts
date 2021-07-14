import { AxiosRequestConfig } from 'axios';
import { Response } from 'types/api-model';

// useProjects
export interface UseProjectsOptionsProps {
  search?: string;
  sort?: string;
  filters?: Record<string, unknown>
}
export interface UseProjectsResponse extends Response {

}

// useSaveProject
export interface UseSaveProjectProps {
  requestConfig?: AxiosRequestConfig
}

export interface SaveProjectProps {
  id?: string,
  data: any
}

export interface UseDeleteProjectProps {
  requestConfig?: AxiosRequestConfig
}

export interface DeleteProjectProps {
  id: string
}

// useUploadProjectPA
export interface UseUploadProjectPAProps {
  requestConfig?: AxiosRequestConfig
}
export interface UploadProjectPAProps {
  id?: string,
  data: any,
}
