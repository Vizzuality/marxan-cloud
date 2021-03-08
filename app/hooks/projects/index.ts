import Fuse from 'fuse.js';
import { useMemo } from 'react';
import { useMutation, useQuery } from 'react-query';
import { useSession } from 'next-auth/client';

import { ItemProps } from 'components/projects/item/component';

import PROJECTS from 'services/projects';
import { UseSaveProjectProps } from './types';

export function useProjects(filters) {
  const [session] = useSession();
  const { search } = filters;

  const query = useQuery('projects', async () => PROJECTS.request({
    method: 'GET',
    url: '/',
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  }));

  const { data } = query;

  return useMemo(() => {
    const parsedData = Array.isArray(data?.data) ? data?.data.map((d):ItemProps => {
      const { id, name } = d;

      return {
        id,
        area: 'Planning area name',
        name,
        description: 'Donec est ad luctus dapibus sociosqu.',
        lastUpdate: '1995-12-17T03:24:00',
        contributors: [
          { id: 1, name: 'Miguel Barrenechea', bgImage: '/images/avatar.png' },
          { id: 2, name: 'Ariadna Martínez', bgImage: '/images/avatar.png' },
        ],
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
      });
      filteredData = fuse.search(search).map((f) => {
        return f.item;
      });
    }

    return {
      ...query,
      data: filteredData,
    };
  }, [query, data?.data, search]);
}

export function useProject(id) {
  const [session] = useSession();

  const query = useQuery(`projects/${id}`, async () => PROJECTS.request({
    method: 'GET',
    url: `/${id}`,
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
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
    url: '/',
  },
}: UseSaveProjectProps) {
  const [session] = useSession();

  return useMutation((data) => {
    return PROJECTS.request({
      method: 'POST',
      url: '/',
      data,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      ...requestConfig,
    });
  }, {
    onSuccess: (data, variables, context) => {
      console.info('Succces', data, variables, context);
    },
    onError: (error, variables, context) => {
      // An error happened!
      console.info('Error', error, variables, context);
    },
  });
}
