import { useMemo } from 'react';

import {
  useInfiniteQuery, useMutation, useQuery, useQueryClient,
} from 'react-query';

import flatten from 'lodash/flatten';
import orderBy from 'lodash/orderBy';

import { useRouter } from 'next/router';

import { formatDistance } from 'date-fns';
import { useSession } from 'next-auth/client';

import { ItemProps } from 'components/projects/item/component';

import PROJECTS from 'services/projects';
import UPLOADS from 'services/uploads';

import {
  UseProjectsOptionsProps,
  UseProjectsResponse,
  UseSaveProjectProps,
  SaveProjectProps,
  UseDeleteProjectProps,
  DeleteProjectProps,
  UseUploadProjectPAProps,
  UploadProjectPAProps,
  UseDuplicateProjectProps,
  DuplicateProjectProps,
  UseUploadProjectPAGridProps,
  UploadProjectPAGridProps,
} from './types';

export function useProjects(options: UseProjectsOptionsProps): UseProjectsResponse {
  const { push } = useRouter();
  const [session] = useSession();

  const {
    filters = {},
    search,
    sort = '-lastModifiedAt',
  } = options;

  const parsedFilters = Object.keys(filters)
    .reduce((acc, k) => {
      return {
        ...acc,
        [`filter[${k}]`]: filters[k].toString(),
      };
    }, {});

  const fetchProjects = ({ pageParam = 1 }) => PROJECTS.request({
    method: 'GET',
    url: '/',
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
    params: {
      'page[number]': pageParam,
      include: 'scenarios,users',
      ...parsedFilters,
      ...search && {
        q: search,
      },
      ...sort && {
        sort,
      },
    },
  });

  const query = useInfiniteQuery(['projects', JSON.stringify(options)], fetchProjects, {
    retry: false,
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
    let parsedData = Array.isArray(pages) ? flatten(pages.map((p) => {
      const { data: { data: pageData } } = p;

      return pageData.map((d): ItemProps => {
        const {
          id, name, description, lastModifiedAt, scenarios, planningAreaName,
        } = d;

        const lastUpdate = scenarios.reduce((acc, s) => {
          const { lastModifiedAt: slastModifiedAt } = s;

          return (slastModifiedAt > acc) ? slastModifiedAt : acc;
        }, lastModifiedAt);

        const lastUpdateDistance = () => {
          return formatDistance(
            new Date(lastUpdate || null),
            new Date(),
            { addSuffix: true },
          );
        };

        return {
          id,
          area: planningAreaName || 'Custom area name',
          name,
          description,
          lastUpdate,
          lastUpdateDistance: lastUpdateDistance(),
          contributors: [],
          onClick: () => {
            push(`/projects/${id}`);
          },
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
      });
    })) : [];

    // Sort
    parsedData = orderBy(parsedData, ['lastUpdate'], ['desc']);

    return {
      ...query,
      data: parsedData,
    };
  }, [query, pages, push]);
}

export function useProject(id) {
  const [session] = useSession();

  const query = useQuery(['projects', id], async () => PROJECTS.request({
    method: 'GET',
    url: `/${id}`,
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
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
    return {
      ...query,
      data: data?.data,
    };
  }, [query, data?.data]);
}

export function useSaveProject({
  requestConfig = {
    method: 'POST',
  },
}: UseSaveProjectProps) {
  const queryClient = useQueryClient();
  const [session] = useSession();

  const saveProject = ({ id, data }: SaveProjectProps) => {
    return PROJECTS.request({
      url: id ? `/${id}` : '/',
      data,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      ...requestConfig,
    });
  };

  return useMutation(saveProject, {
    onSuccess: (data: any, variables, context) => {
      const { id } = data;
      queryClient.invalidateQueries('projects');
      queryClient.invalidateQueries(['projects', id]);
      console.info('Succces', data, variables, context);
    },
    onError: (error, variables, context) => {
      // An error happened!
      console.info('Error', error, variables, context);
    },
  });
}

export function useDeleteProject({
  requestConfig = {
    method: 'DELETE',
  },
}: UseDeleteProjectProps) {
  const queryClient = useQueryClient();
  const [session] = useSession();

  const deleteProject = ({ id }: DeleteProjectProps) => {
    return PROJECTS.request({
      method: 'DELETE',
      url: `/${id}`,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      ...requestConfig,
    });
  };

  return useMutation(deleteProject, {
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries('projects');
      console.info('Succces', data, variables, context);
    },
    onError: (error, variables, context) => {
      // An error happened!
      console.info('Error', error, variables, context);
    },
  });
}

export function useUploadProjectPA({
  requestConfig = {
    method: 'POST',
  },
}: UseUploadProjectPAProps) {
  const [session] = useSession();

  const uploadProjectPAShapefile = ({ data }: UploadProjectPAProps) => {
    return UPLOADS.request({
      url: '/projects/planning-area/shapefile',
      data,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        'Content-Type': 'multipart/form-data',
      },
      ...requestConfig,
    });
  };

  return useMutation(uploadProjectPAShapefile, {
    onSuccess: (data: any, variables, context) => {
      console.info('Succces', data, variables, context);
    },
    onError: (error, variables, context) => {
      console.info('Error', error, variables, context);
    },
  });
}

export function useUploadProjectPAGrid({
  requestConfig = {
    method: 'POST',
  },
}: UseUploadProjectPAGridProps) {
  const [session] = useSession();

  const uploadProjectPAShapefileGrid = ({ data }: UploadProjectPAGridProps) => {
    return UPLOADS.request({
      url: '/projects/planning-area/shapefile-grid',
      data,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        'Content-Type': 'multipart/form-data',
      },
      ...requestConfig,
    });
  };

  return useMutation(uploadProjectPAShapefileGrid, {
    onSuccess: (data: any, variables, context) => {
      console.info('Succces', data, variables, context);
    },
    onError: (error, variables, context) => {
      console.info('Error', error, variables, context);
    },
  });
}

export function useDuplicateProject({
  requestConfig = {
    method: 'POST',
  },
}: UseDuplicateProjectProps) {
  const queryClient = useQueryClient();
  const [session] = useSession();

  const duplicateProject = ({ id }: DuplicateProjectProps) => {
    return PROJECTS.request({
      // Pending endpoint
      url: `/${id}`,
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
      queryClient.invalidateQueries(['projects', id]);
      console.info('Succces', data, variables, context);
    },
    onError: (error, variables, context) => {
      // An error happened!
      console.info('Error', error, variables, context);
    },
  });
}
