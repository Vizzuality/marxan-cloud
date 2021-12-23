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

// useProjectUsers
export interface UseProjectUsersOptionsProps {
  search?: string;
}

// useDeleteProjectUser

export interface DeleteProjectUserProps {
  userId: string,
  projectId: string | string[],
}

export interface UseDeleteProjectUserProps {
  requestConfig?: AxiosRequestConfig,
}

// useUploadProjectPA
export interface UseUploadProjectPAProps {
  requestConfig?: AxiosRequestConfig
}
export interface UploadProjectPAProps {
  id?: string,
  data: any,
}

// useUploadProjectPAGrid

export interface UseUploadProjectPAGridProps {
  requestConfig?: AxiosRequestConfig
}
export interface UploadProjectPAGridProps {
  data: any,
}

// useDuplicateProject
export interface UseDuplicateProjectProps {
  requestConfig?: AxiosRequestConfig;
}

export interface DuplicateProjectProps {
  id: string | string[];
}

// usePublishProject
export interface UsePublishProjectProps {
  requestConfig?: AxiosRequestConfig;
}
export interface PublishProjectProps {
  id: string | string[];
}
