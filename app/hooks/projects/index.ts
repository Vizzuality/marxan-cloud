import Fuse from 'fuse.js';
import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useSession } from 'next-auth/client';
import { useRouter } from 'next/router';

import orderBy from 'lodash/orderBy';
import { formatDistance } from 'date-fns';

import { ItemProps } from 'components/projects/item/component';

import PROJECTS from 'services/projects';
import {
  UseProjectsProps,
  UseProjectsResponse,
  UseSaveProjectProps,
  SaveProjectProps,
  UseDeleteProjectProps,
  DeleteProjectProps,
} from './types';

export function useProjects(filters: UseProjectsProps): UseProjectsResponse {
  const [session] = useSession();
  const { search } = filters;
  const { push } = useRouter();

  const query = useQuery('projects', async () => PROJECTS.request({
    method: 'GET',
    url: '/',
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
    params: {
      include: 'scenarios,users',
    },
  }));

  const { data } = query;

  return useMemo(() => {
    let parsedData = Array.isArray(data?.data?.data) ? data?.data?.data.map((d):ItemProps => {
      const {
        id, name, description, scenarios, lastModifiedAt,
      } = d;

      const lastUpdate = scenarios.reduce((acc, s) => {
        const { lastModifiedAt: slastModifiedAt } = s;

        return (slastModifiedAt > acc) ? slastModifiedAt : acc;
      }, lastModifiedAt);

      const lastUpdateDistance = () => {
        return formatDistance(
          new Date(lastUpdate || null),
          new Date(),
          { addSuffix: true },
        );
      };

      return {
        id,
        area: 'Planning area name',
        name,
        description,
        lastUpdate,
        lastUpdateDistance: lastUpdateDistance(),
        contributors: [
          { id: 1, name: 'Miguel Barrenechea', bgImage: '/images/avatar.png' },
          { id: 2, name: 'Ariadna Martínez', bgImage: '/images/avatar.png' },
        ],
        onClick: () => {
          push(`/projects/${id}`);
        },
        onDownload: (e) => {
          console.info('onDownload', e);
        },
        onDuplicate: (e) => {
          console.info('onDuplicate', e);
        },
        onDelete: (e) => {
          console.info('onDelete', e);
        },
      };
    }) : [];

    // Filter
    if (search) {
      const fuse = new Fuse(parsedData, {
        keys: ['name', 'area'],
        threshold: 0.25,
      });
      parsedData = fuse.search(search).map((f) => {
        return f.item;
      });
    }

    // Sort
    parsedData = orderBy(parsedData, ['lastUpdate'], ['desc']);

    return {
      ...query,
      data: parsedData,
    };
  }, [query, data?.data?.data, search, push]);
}

export function useProject(id) {
  const [session] = useSession();

  const query = useQuery(['projects', id], async () => PROJECTS.request({
    method: 'GET',
    url: `/${id}`,
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
    params: {
      include: 'scenarios,users',
    },
  }), {
    enabled: !!id,
  });

  const { data } = query;

  return useMemo(() => {
    return {
      ...query,
      data: data?.data?.data,
    };
  }, [query, data?.data?.data]);
}

export function useSaveProject({
  requestConfig = {
    method: 'POST',
  },
}: UseSaveProjectProps) {
  const queryClient = useQueryClient();
  const [session] = useSession();

  const saveProject = ({ id, data }: SaveProjectProps) => {
    return PROJECTS.request({
      url: id ? `/${id}` : '/',
      data,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      ...requestConfig,
    });
  };

  return useMutation(saveProject, {
    onSuccess: (data: any, variables, context) => {
      const { id } = data;
      queryClient.invalidateQueries('projects');
      queryClient.invalidateQueries(['projects', id]);
      console.info('Succces', data, variables, context);
    },
    onError: (error, variables, context) => {
      // An error happened!
      console.info('Error', error, variables, context);
    },
  });
}

export function useDeleteProject({
  requestConfig = {
    method: 'DELETE',
  },
}: UseDeleteProjectProps) {
  const queryClient = useQueryClient();
  const [session] = useSession();

  const deleteProject = ({ id }: DeleteProjectProps) => {
    return PROJECTS.request({
      method: 'DELETE',
      url: `/${id}`,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      ...requestConfig,
    });
  };

  return useMutation(deleteProject, {
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries('projects');
      console.info('Succces', data, variables, context);
    },
    onError: (error, variables, context) => {
      // An error happened!
      console.info('Error', error, variables, context);
    },
  });
}
