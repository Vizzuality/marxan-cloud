import { useMemo } from 'react';
import { useQuery } from 'react-query';
import { useAuth } from 'hooks/authorization';

import { ItemProps } from 'components/projects/item/component';

import PROJECTS from 'services/projects';

export function useProjects() {
  const { token } = useAuth();

  const query = useQuery('projects', async () => PROJECTS.request({
    method: 'GET',
    url: '/',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }));

  const { data } = query;

  return useMemo(() => {
    return {
      ...query,
      data: Array.isArray(data?.data) ? data?.data.map((d):ItemProps => {
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
      }) : [],
    };
  }, [query, data?.data]);
}

export function useProject(id) {
  const query = useQuery(`projects/${id}`, async () => PROJECTS.request({
    method: 'GET',
    url: `/${id}`,
  }));

  return query;
}
