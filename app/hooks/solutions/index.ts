import { useMemo } from 'react';
import {
  useInfiniteQuery,
} from 'react-query';
import { useSession } from 'next-auth/client';

import flatten from 'lodash/flatten';

import PROJECTS from 'services/projects';

import {
  UseSolutionsOptionsProps,
} from './types';

export function useSolutions(projectId, options: UseSolutionsOptionsProps = {}) {
  const [session] = useSession();

  const {
    filters = {},
    search,
    sort,
  } = options;

  const parsedFilters = Object.keys(filters)
    .reduce((acc, k) => {
      return {
        ...acc,
        [`filter[${k}]`]: filters[k],
      };
    }, {});

  const fetchFeatures = ({ pageParam = 1 }) => PROJECTS.request({
    method: 'GET',
    url: `/${projectId}/features`,
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
    params: {
      'page[number]': pageParam,
      ...parsedFilters,
      ...search && {
        q: search,
      },
      ...sort && {
        sort,
      },
    },
  });

  const query = useInfiniteQuery(['solutions', projectId, JSON.stringify(options)], fetchFeatures, {
    keepPreviousData: true,
    getNextPageParam: (lastPage) => {
      const { data: { meta } } = lastPage;
      const { page, totalPages } = meta;

      const nextPage = page + 1 > totalPages ? null : page + 1;
      return nextPage;
    },
  });

  const { data } = query;
  const { pages } = data || {};

  return useMemo(() => {
    const parsedData = Array.isArray(pages) ? flatten(pages.map((p) => {
      const { data: { data: pageData } } = p;

      return pageData.map((d) => {
        const {
          id,
          alias,
          featureClassName,
        } = d;

        return {
          id,
          name: alias || featureClassName,
          run: Math.round(Math.random() * 100),
          score: Math.round(Math.random() * 200),
          cost: Math.round(Math.random() * 300),
          planningUnits: Math.round(Math.random() * 20),
          missingValues: Math.round(Math.random() * 10),
        };
      });
    })) : [];

    return {
      ...query,
      data: parsedData,
    };
  }, [query, pages]);
}
