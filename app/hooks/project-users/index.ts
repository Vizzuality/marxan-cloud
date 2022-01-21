import { useMemo } from 'react';

import {
  useMutation, useQuery, useQueryClient,
} from 'react-query';

import { useSession } from 'next-auth/client';

import { useMe } from 'hooks/me';

import ROLES from 'services/roles';

import {
  UseProjectUsersOptionsProps,
  DeleteProjectUserProps,
  UseDeleteProjectUserProps,
  UseSaveProjectUserRoleProps,
  SaveProjectUserRoleProps,
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

export function useProjectRole(projectId) {
  const { data: me } = useMe();
  const { data: projectUsers } = useProjectUsers(projectId);

  const meId = me?.data?.id;

  const projectRole = projectUsers?.find((r) => r.user.id === meId)?.roleName;

  return useMemo(() => {
    return {
      data: projectRole,
    };
  }, [projectRole]);
}

export function useSaveProjectUserRole({
  requestConfig = {
    method: 'PATCH',
  },
}: UseSaveProjectUserRoleProps) {
  const queryClient = useQueryClient();
  const [session] = useSession();

  const saveProjectUserRole = ({ projectId, data }: SaveProjectUserRoleProps) => {
    return ROLES.request({
      url: `/${projectId}/users`,
      data,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      ...requestConfig,
    });
  };

  return useMutation(saveProjectUserRole, {
    onSuccess: (data: any, variables, context) => {
      const { projectId } = variables;
      queryClient.invalidateQueries('projects');
      queryClient.invalidateQueries(['roles', projectId]);
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
      const { projectId } = variables;
      queryClient.invalidateQueries('projects');
      queryClient.invalidateQueries(['roles', projectId]);
      console.info('Succces', data, variables, context);
    },
    onError: (error, variables, context) => {
      console.info('Error', error, variables, context);
    },
  });
}
