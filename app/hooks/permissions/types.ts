import { AxiosRequestConfig } from 'axios';

// UseSaveProjectUserRole
export interface SaveProjectUserRoleProps {
  projectId: string,
  data: unknown,
}
export interface UseSaveProjectUserRoleProps {
  requestConfig?: AxiosRequestConfig,
}

// useDeleteProjectUser
export interface DeleteProjectUserProps {
  userId: string,
  projectId: string | string[],
}

export interface UseDeleteProjectUserProps {
  requestConfig?: AxiosRequestConfig,
}
