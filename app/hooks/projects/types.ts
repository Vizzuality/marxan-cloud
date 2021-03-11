import { AxiosRequestConfig } from 'axios';
import { Response } from 'types/api-model';

// useProjects
export interface UseProjectsProps {
  search?: string;
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
