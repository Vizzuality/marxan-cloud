import { useMemo } from 'react';

import { useMutation, useQuery, useQueryClient } from 'react-query';

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

  const fetchPublishedProjects = () =>
    PUBLISHED_PROJECTS.request({
      method: 'GET',
      url: '/',
      params: {
        ...parsedFilters,
        ...(search && {
          q: search,
        }),
      },
    }).then((response) => response.data);

  return useQuery(['published-projects', JSON.stringify(options)], fetchPublishedProjects, {
    retry: false,
    keepPreviousData: true,
    placeholderData: { data: [] },

    select: ({ data }) =>
      data.map((d): PublishedItemProps => {
        const { id, name, description, location, creators, resources, company, pngData, exportId } =
          d;

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
      }),
  });
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
