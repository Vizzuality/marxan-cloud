import { useMemo } from 'react';
import { useQuery } from 'react-query';

import { ItemProps } from 'components/projects/item/component';

import PROJECTS from 'services/projects';

export function useProjects() {
  const query = useQuery('projects', async () => PROJECTS.request({
    method: 'GET',
    url: '/',
    params: {
      _page: 1,
      _limit: 10,
    },
  }));

  const { data } = query;

  return useMemo(() => {
    return {
      ...query,
      data: Array.isArray(data?.data) ? data?.data.map((d):ItemProps => {
        const { id } = d;
        return {
          id,
          area: 'Planning area name',
          name: 'Project Name 1',
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
