import { useMemo } from 'react';

import {
  useMutation, useQueries, useQuery, useQueryClient,
} from 'react-query';

import chroma from 'chroma-js';
import { uniqBy } from 'lodash';
import { useSession } from 'next-auth/client';

import { useMe } from 'hooks/me';

import ROLES from 'services/roles';

import {
  DeleteProjectUserProps,
  UseDeleteProjectUserProps,
  UseSaveProjectUserRoleProps,
  SaveProjectUserRoleProps,
} from './types';

const COLOR_ME = '#1b72f5';
const COLORS = ['#03E7D1', '#A8FFED', '#5ED3FF', '#46A0FF', '#674BFD', '#9713DD', '#D383FE', '#F65884', '#FF7470', '#FE8B5C', '#FEC95A', '#FFF1A0'];

function fetchProjectUsers(pId, session) {
  return ROLES.request({
    method: 'GET',
    url: `/${pId}/users`,
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
    params: {},
    transformResponse: (data) => JSON.parse(data),
  }).then((response) => {
    return response.data;
  });
}

export function useProjectsUsers(projectsIds) {
  const [session] = useSession();
  const { user } = useMe();

  const userQueries = useQueries(
    projectsIds.map((p) => {
      return {
        queryKey: ['roles', p],
        queryFn: () => fetchProjectUsers(p, session),
      };
    }),
  );

  const USERS = useMemo(() => {
    if (userQueries.every((u) => u?.isFetched)) {
      const uniqUsers = uniqBy(
        userQueries
          .map((u:any) => {
            const { data } = u;
            return data?.data;
          })
          .flat(),
        (u) => u?.user?.id,
      );
      return uniqUsers
        .map((u) => u?.user?.id)
        .filter((u) => !!u);
    }
    return [];
  }, [userQueries]);

  const COLORS_SCALE = chroma.scale(COLORS).colors(USERS.length);

  return useMemo(() => {
    return {
      data: USERS.reduce((acc, u, i) => {
        return {
          ...acc,
          [u]: (USERS.length > 10) ? COLORS_SCALE[i] : COLORS[i],
          ...user.id === u && {
            [u]: COLOR_ME,
          },
        };
      }, {}),
    };
  }, [user, USERS, COLORS_SCALE]);
}

export function useProjectUsers(projectId) {
  const [session] = useSession();
  const { user } = useMe();

  const query = useQuery(['roles', projectId], () => fetchProjectUsers(projectId, session), {
    enabled: !!projectId,
  });

  const { data } = query;

  return useMemo(() => {
    return {
      ...query,
      data: data?.data.sort((a, b) => {
        const ROLES_SORT = {
          project_owner: 1,
          project_contributor: 2,
          project_viewer: 3,
        };

        if (a.user.id === user.id) return -1;
        if (b.user.id === user.id) return 1;
        if (ROLES_SORT[a.roleName] < ROLES_SORT[b.roleName]) return -1;
        if (ROLES_SORT[a.roleName] > ROLES_SORT[b.roleName]) return 1;
        return 0;
      })
      ,
    };
  }, [query, data?.data, user]);
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
