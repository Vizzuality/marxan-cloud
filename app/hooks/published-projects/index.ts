import { useMemo } from 'react';

import {
  useInfiniteQuery, useQuery,
} from 'react-query';

import flatten from 'lodash/flatten';

import { PublishedItemProps } from 'components/projects/published-item/component';

import PUBLISHED_PROJECTS from 'services/published-projects';

import {
  UsePublishedProjectsProps,
} from './types';

export function usePublishedProjects(options: UsePublishedProjectsProps = {}) {
  const {
    search,
    filters = {},
    // sort = '-lastModifiedAt',
  } = options;

  const parsedFilters = Object.keys(filters)
    .reduce((acc, k) => {
      return {
        ...acc,
        [`filter[${k}]`]: filters[k].toString(),
      };
    }, {});

  const fetchPublishedProjects = ({ pageParam = 1 }) => PUBLISHED_PROJECTS.request({
    method: 'GET',
    url: '/',
    params: {
      'page[number]': pageParam,
      ...parsedFilters,
      ...search && {
        q: search,
      },
      // ...sort && {
      //   sort,
      // },
    },
  });

  const query = useInfiniteQuery(['published-projects', JSON.stringify(options)], fetchPublishedProjects, {
    retry: false,
    keepPreviousData: true,
    refetchInterval: 5000,
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

      return pageData.map((d): PublishedItemProps => {
        const {
          id, name, description, planningAreaName, timesDuplicated,
        } = d;

        const contributors = [
          { id: 1, name: '', bgImage: '' },
          { id: 2, name: '', bgImage: '' },
        ];

        return {
          id,
          name,
          area: planningAreaName,
          description,
          timesDuplicated,
          contributors,
        };
      });
    })) : [];

    return {
      ...query,
      data: parsedData,
    };
  }, [query, pages]);
}

export function usePublishedProject(id) {
  const query = useQuery(['published-projects', id], async () => PUBLISHED_PROJECTS.request({
    method: 'GET',
    url: `/${id}`,
    params: {
      include: 'scenarios,users',
    },
  }).then((response) => {
    return response.data;
  }), {
    enabled: !!id,
  });

  const { data } = query;

  return useMemo(() => {
    const contributors = [
      { id: 1, name: '', bgImage: '' },
      { id: 2, name: '', bgImage: '' },
    ];
    const parsedData = { ...data?.data, contributors } || {};

    return {
      ...query,
      data: parsedData,
    };
  }, [query, data?.data]);
}
