import { useMemo } from 'react';

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from 'react-query';

import flatten from 'lodash/flatten';
import { useSession } from 'next-auth/react';

import { PublishedItemProps } from 'layout/community/published-projects/list/table/item/component';

import PROJECTS from 'services/projects';
import PUBLISHED_PROJECTS from 'services/published-projects';

import {
  DuplicatePublishedProjectProps,
  UseDuplicatePublishedProjectProps,
  UsePublishedProjectsProps,
} from './types';

export function usePublishedProjects(options: UsePublishedProjectsProps = {}) {
  const { search, filters = {} } = options;

  const parsedFilters = Object.keys(filters).reduce((acc, k) => {
    return {
      ...acc,
      [`filter[${k}]`]: filters[k].toString(),
    };
  }, {});

  const fetchPublishedProjects = ({ pageParam = 1 }) =>
    PUBLISHED_PROJECTS.request({
      method: 'GET',
      url: '/',
      params: {
        'page[number]': pageParam,
        ...parsedFilters,
        ...(search && {
          q: search,
        }),
      },
    });

  const query = useInfiniteQuery(
    ['published-projects', JSON.stringify(options)],
    fetchPublishedProjects,
    {
      retry: false,
      keepPreviousData: true,
      getNextPageParam: (lastPage) => {
        const {
          data: { meta },
        } = lastPage;
        const { page, totalPages } = meta;

        const nextPage = page + 1 > totalPages ? null : page + 1;
        return nextPage;
      },
    }
  );

  const { data } = query;
  const { pages } = data || {};

  return useMemo(() => {
    const parsedData = Array.isArray(pages)
      ? flatten(
          pages.map((p) => {
            const {
              data: { data: pageData },
            } = p;

            return pageData.map((d): PublishedItemProps => {
              const {
                id,
                name,
                description,
                location,
                creators,
                resources,
                company,
                pngData,
                exportId,
              } = d;

              return {
                id,
                name,
                description,
                location,
                creators,
                resources,
                company,
                pngData,
                exportId,
              };
            });
          })
        )
      : [];

    return {
      ...query,
      data: parsedData,
    };
  }, [query, pages]);
}

export function usePublishedProject(id) {
  const query = useQuery(
    ['published-projects', id],
    async () =>
      PUBLISHED_PROJECTS.request({
        method: 'GET',
        url: `/${id}`,
      }).then((response) => {
        return response.data;
      }),
    {
      enabled: !!id,
    }
  );

  const { data } = query;

  return useMemo(() => {
    return {
      ...query,
      data: data?.data,
    };
  }, [query, data?.data]);
}

export function useDuplicatePublishedProject({
  requestConfig = {
    method: 'POST',
  },
}: UseDuplicatePublishedProjectProps) {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  const duplicateProject = ({ exportId }: DuplicatePublishedProjectProps) => {
    return PROJECTS.request({
      // Pending endpoint
      url: `/published-projects/${exportId}/clone`,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      ...requestConfig,
    });
  };

  return useMutation(duplicateProject, {
    onSuccess: (data: any, variables, context) => {
      const { id } = data;
      queryClient.invalidateQueries('projects');
      queryClient.invalidateQueries(['project', id]);
      console.info('Succces', data, variables, context);
    },
    onError: (error, variables, context) => {
      // An error happened!
      console.info('Error', error, variables, context);
    },
  });
}
