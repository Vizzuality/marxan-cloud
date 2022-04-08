import { useMemo } from 'react';

import {
  useQuery,
} from 'react-query';

import { useSession } from 'next-auth/client';

import ADMIN from 'services/admin';
// import TEST from 'services/test';

import {
  UseAdminPublishedProjectsProps,
} from './types';

export function useAdminPublishedProjects(options: UseAdminPublishedProjectsProps = { page: 1 }) {
  const [session] = useSession();

  const {
    page,
    search,
    filters = {},
    sort,
  } = options;

  const parsedFilters = Object.keys(filters)
    .reduce((acc, k) => {
      return {
        ...acc,
        [`filter[${k}]`]: filters[k].toString(),
      };
    }, {});

  const parsedSort = useMemo(() => {
    if (!sort) {
      return '';
    }

    const direction = sort.direction === 'asc' ? '-' : '';
    return `${direction}${sort.column}`;
  }, [sort]);

  const fetchPublishedProjects = () => ADMIN.request({
    method: 'GET',
    url: '/projects/published-projects/by-admin',
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
    params: {
      'page[number]': page,
      ...parsedFilters,
      ...search && {
        q: search,
      },
      ...parsedSort && {
        sort: parsedSort,
      },
    },
  }).then((response) => response.data);

  // TEST
  // const fetchPublishedProjects = () => TEST.request({
  //   method: 'GET',
  //   url: '/',
  //   headers: {
  //     Authorization: `Bearer ${session.accessToken}`,
  //   },
  //   params: {
  //     _page: page,
  //     _limit: 10,
  //     ...sort && {
  //       _sort: sort.column,
  //       _order: sort.direction,
  //     },
  //   },
  // }).then((response) => response.data);

  const query = useQuery(['admin-published-projects', JSON.stringify(options), page], fetchPublishedProjects, {
    retry: false,
    keepPreviousData: true,
    placeholderData: {
      data: [],
      meta: {} as any,
    },
    // TEST
    // placeholderData: [],
  });

  const { data } = query;

  return useMemo(() => {
    return {
      ...query,
      // data: data.map((d) => {
      //   return {
      //     title: d.title,
      //     area: 'custom',
      //     status: 'published',
      //     owner: {
      //       name: 'Miguel Barrenechea',
      //       email: 'barrenechea.miguel@gmail.com',
      //     },
      //   };
      // }),
      // meta: {
      //   page: 1,
      //   totalPages: 20,
      //   size: 5,
      //   totalItems: 100,
      // },
      data: data?.data.map((d) => {
        return {
          id: d.id,
          name: d.name,
          description: d.description,
          status: d.underModeration ? 'under-moderation' : 'published',
          owner: {
            name: 'Miguel Barrenechea',
            email: 'barrenechea.miguel@gmail.com',
          },
        };
      }),
      meta: data?.meta,
    };
  }, [query, data]);
}
