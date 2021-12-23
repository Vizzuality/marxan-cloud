import { AxiosRequestConfig } from 'axios';

// useProjectUsers
export interface UseProjectUsersOptionsProps {
  search?: string;
}

// UseEditProjectUserRole
export interface EditProjectUserRoleProps {
  projectId: string,
  data: unknown,
}
export interface UseEditProjectUserRoleProps {
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
