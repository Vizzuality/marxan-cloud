import { useMemo } from 'react';

import {
  useMutation, useQuery, useQueryClient,
} from 'react-query';

import { useSession } from 'next-auth/client';

import ROLES from 'services/roles';

import {
  UseProjectUsersOptionsProps,
  DeleteProjectUserProps,
  UseDeleteProjectUserProps,
  UseEditProjectUserRoleProps,
  EditProjectUserRoleProps,
} from './types';

export function useProjectUsers(projectId, options: UseProjectUsersOptionsProps = {}) {
  const [session] = useSession();

  const { search } = options;

  const query = useQuery(['roles', projectId], async () => ROLES.request({
    method: 'GET',
    url: `/${projectId}/users`,
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
    params: {
      ...search && {
        q: search,
      },
    },
    transformResponse: (data) => JSON.parse(data),
  }).then((response) => {
    return response;
  }), {
    enabled: !!projectId,
  });

  const { data } = query;

  return useMemo(() => {
    return {
      ...query,
      data: data?.data?.data,
    };
  }, [query, data?.data?.data]);
}

export function useEditProjectUserRole({
  requestConfig = {
    method: 'PATCH',
  },
}: UseEditProjectUserRoleProps) {
  const queryClient = useQueryClient();
  const [session] = useSession();

  const editProjectUserRole = ({ projectId, data }: EditProjectUserRoleProps) => {
    return ROLES.request({
      url: `/${projectId}/users`,
      data,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      ...requestConfig,
    });
  };

  return useMutation(editProjectUserRole, {
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries('projects');
      console.info('Succces', data, variables, context);
    },
    onError: (error, variables, context) => {
      console.info('Error', error, variables, context);
    },
  });
}

export function useDeleteProjectUser({
  requestConfig = {
    method: 'DELETE',
  },
}: UseDeleteProjectUserProps) {
  const queryClient = useQueryClient();
  const [session] = useSession();

  const deleteProjectUser = ({ projectId, userId }: DeleteProjectUserProps) => {
    return ROLES.request({
      method: 'DELETE',
      url: `/${projectId}/users/${userId}`,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      ...requestConfig,
    });
  };

  return useMutation(deleteProjectUser, {
    onSuccess: (data: any, variables, context) => {
      const { projectId } = data;
      queryClient.invalidateQueries(['projects', projectId]);
      console.info('Succces', data, variables, context);
    },
    onError: (error, variables, context) => {
      console.info('Error', error, variables, context);
    },
  });
}
