import { useMemo } from 'react';

import {
  useQuery,
} from 'react-query';

import { useSession } from 'next-auth/client';

// import ADMIN from 'services/admin';
import TEST from 'services/test';

import {
  UseAdminPublishedProjectsProps,
} from './types';

export function useAdminPublishedProjects(options: UseAdminPublishedProjectsProps = { page: 1 }) {
  const [session] = useSession();

  const {
    page,
    // search,
    // filters = {},
    sort,
  } = options;

  // const parsedFilters = Object.keys(filters)
  //   .reduce((acc, k) => {
  //     return {
  //       ...acc,
  //       [`filter[${k}]`]: filters[k].toString(),
  //     };
  //   }, {});

  // const fetchPublishedProjects = () => ADMIN.request({
  //   method: 'GET',
  //   url: '/projects/published-projects/by-admin',
  //   headers: {
  //     Authorization: `Bearer ${session.accessToken}`,
  //   },
  //   params: {
  //     'page[number]': page,
  //     ...parsedFilters,
  //     ...search && {
  //       q: search,
  //     },
  //   },
  // }).then((response) => response.data);

  const fetchPublishedProjects = () => TEST.request({
    method: 'GET',
    url: '/',
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
    params: {
      _page: page,
      _limit: 25,
      ...sort && {
        _sort: sort.column,
        _order: sort.direction,
      },
    },
  }).then((response) => response.data);

  const query = useQuery(['admin-published-projects', JSON.stringify(options), page], fetchPublishedProjects, {
    retry: false,
    keepPreviousData: true,
    // placeholderData: {
    //   data: [],
    //   meta: {} as any,
    // },
    placeholderData: [],
  });

  const { data } = query;

  return useMemo(() => {
    return {
      ...query,
      data: data.map((d) => {
        return {
          name: d.title,
          planningAreaName: 'custom',

        };
      }),
      meta: {
        page: 1,
        totalPages: 4,
        size: 25,
        totalItems: 100,
      },
      // data: data?.data,
      // meta: data?.meta
    };
  }, [query, data]);
}
