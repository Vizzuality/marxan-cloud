import Fuse from 'fuse.js';
import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useSession } from 'next-auth/client';
import { useRouter } from 'next/router';
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
    const parsedData = Array.isArray(data?.data) ? data?.data.map((d):ItemProps => {
      const { id, name, description } = d;

      const lastUpdate = formatDistance(new Date('2021-03-10T11:22:00'), new Date(), { addSuffix: true });

      return {
        id,
        area: 'Planning area name',
        name,
        description,
        lastUpdate,
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

    let filteredData = parsedData;

    if (search) {
      const fuse = new Fuse(parsedData, {
        keys: ['name', 'area'],
        threshold: 0.25,
      });
      filteredData = fuse.search(search).map((f) => {
        return f.item;
      });
    }

    return {
      ...query,
      data: filteredData,
    };
  }, [query, data?.data, search, push]);
}

export function useProject(id) {
  const [session] = useSession();

  const query = useQuery(`projects/${id}`, async () => PROJECTS.request({
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
      data: data?.data,
    };
  }, [query, data?.data]);
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
