import { useMemo } from 'react';
import {
  useInfiniteQuery,
} from 'react-query';
import { useSession } from 'next-auth/client';

import flatten from 'lodash/flatten';

// import { ItemProps as RawItemProps } from 'components/gap-analysis/item/component';

import PROJECTS from 'services/projects';

import {
  UseSolutionsOptionsProps,
} from './types';

import ITEMS from './mock';

// interface AllItemProps extends RawItemProps {}

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

  const fetchSolutions = ({ pageParam = 1 }) => PROJECTS.request({
    method: 'GET',
    url: `/${projectId}/solutions`,
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

  const query = useInfiniteQuery(['solutions', projectId, JSON.stringify(options)], fetchSolutions, {
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
    const parsedData = Array.isArray(pages) ? flatten(pages.map(() => {
      // const { data: { data: pageData } } = p;

      // Temporary mock data
      return ITEMS;
    })) : [];

    return {
      ...query,
      data: parsedData,
    };
  }, [query, pages]);
}
