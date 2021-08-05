import { useMemo } from 'react';

import {
  useQuery, useInfiniteQuery, useMutation, useQueryClient,
} from 'react-query';

import { useRouter } from 'next/router';

import { formatDistanceToNow } from 'date-fns';
import flatten from 'lodash/flatten';
import { useSession } from 'next-auth/client';

import { ItemProps } from 'components/scenarios/item/component';

import DOWNLOADS from 'services/downloads';
import PROJECTS from 'services/projects';
import SCENARIOS from 'services/scenarios';
import UPLOADS from 'services/uploads';

import {
  UseScenariosOptionsProps,
  UseSaveScenarioProps,
  SaveScenarioProps,
  UseDeleteScenarioProps,
  DeleteScenarioProps,
  UseDownloadScenarioCostSurfaceProps,
  DownloadScenarioCostSurfaceProps,
  UseUploadScenarioCostSurfaceProps,
  UploadScenarioCostSurfaceProps,
  UseUploadScenarioPUProps,
  UploadScenarioPUProps,
  UseSaveScenarioPUProps,
  SaveScenarioPUProps,
  UseDuplicateScenarioProps,
  DuplicateScenarioProps,
  UseRunScenarioProps,
  RunScenarioProps,
  UseCancelRunScenarioProps,
  CancelRunScenarioProps,
} from './types';

export function useScenarios(pId, options: UseScenariosOptionsProps = {}) {
  const [session] = useSession();
  const { push } = useRouter();

  const {
    filters = {},
    search,
    sort,
  } = options;

  const parsedFilters = Object.keys(filters)
    .reduce((acc, k) => {
      return {
        ...acc,
        [`filter[${k}]`]: (filters[k] && filters[k].toString) ? filters[k].toString() : filters[k],
      };
    }, {});

  const fetchScenarios = ({ pageParam = 1 }) => SCENARIOS.request({
    method: 'GET',
    url: '/',
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

  const query = useInfiniteQuery(['scenarios', pId, JSON.stringify(options)], fetchScenarios, {
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
    const parsedData = Array.isArray(pages) ? flatten(pages.map((p) => {
      const { data: { data: pageData } } = p;

      return pageData.map((d):ItemProps => {
        const {
          id, projectId, name, lastModifiedAt,
        } = d;

        const lastUpdateDistance = () => {
          return formatDistanceToNow(
            new Date(lastModifiedAt),
            { addSuffix: true },
          );
        };

        return {
          id,
          name,
          lastUpdate: lastModifiedAt,
          lastUpdateDistance: lastUpdateDistance(),
          warnings: false,
          onEdit: () => {
            push(`/projects/${projectId}/scenarios/${id}/edit`);
          },
          onView: () => {
            push(`/projects/${projectId}/scenarios/${id}`);
          },
        };
      });
    })) : [];

    return {
      ...query,
      data: parsedData,
    };
  }, [query, pages, push]);
}

export function useScenario(id) {
  const [session] = useSession();

  const query = useQuery(['scenarios', id], async () => SCENARIOS.request({
    method: 'GET',
    url: `/${id}`,
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
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

// SCENARIO STATUS
export function useScenariosStatus(pId) {
  const [session] = useSession();

  const query = useQuery(['scenarios-status', pId], async () => PROJECTS.request({
    method: 'GET',
    url: `/${pId}/scenarios/status`,
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  }).then((response) => {
    return response.data;
  }), {
    enabled: !!pId,
    placeholderData: {
      data: {
        scenarios: [],
      },
    },
    refetchInterval: 5000,
  });

  const { data } = query;

  return useMemo(() => {
    return {
      ...query,
      data: data?.data,
    };
  }, [query, data?.data]);
}

export function useSaveScenario({
  requestConfig = {
    method: 'POST',
  },
}: UseSaveScenarioProps) {
  const queryClient = useQueryClient();
  const [session] = useSession();

  const saveScenario = ({ id, data }: SaveScenarioProps) => {
    console.log('ID on HOOKS', id);
    console.log('DATA on HOOKS', data);
    return SCENARIOS.request({
      url: id ? `/${id}` : '/',
      data,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      ...requestConfig,
    });
  };

  return useMutation(saveScenario, {
    onSuccess: (data: any, variables, context) => {
      const { id, projectId } = data?.data?.data;
      queryClient.invalidateQueries(['scenarios', projectId]);
      queryClient.setQueryData(['scenarios', id], data?.data);
      console.info('Succces', data, variables, context);
    },
    onError: (error, variables, context) => {
      // An error happened!
      console.info('Error', error, variables, context);
    },
  });
}

export function useDeleteScenario({
  requestConfig = {
    method: 'DELETE',
  },
}: UseDeleteScenarioProps) {
  const [session] = useSession();

  const deleteScenario = ({ id }: DeleteScenarioProps) => {
    return SCENARIOS.request({
      method: 'DELETE',
      url: `/${id}`,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      ...requestConfig,
    });
  };

  return useMutation(deleteScenario, {
    onSuccess: (data, variables, context) => {
      console.info('Succces', data, variables, context);
    },
    onError: (error, variables, context) => {
      // An error happened!
      console.info('Error', error, variables, context);
    },
  });
}

export function useUploadScenarioPU({
  requestConfig = {
    method: 'POST',
  },
}: UseUploadScenarioPUProps) {
  const [session] = useSession();

  const uploadScenarioPUShapefile = ({ id, data }: UploadScenarioPUProps) => {
    return UPLOADS.request({
      url: `/scenarios/${id}/planning-unit-shapefile`,
      data,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        'Content-Type': 'multipart/form-data',
      },
      ...requestConfig,
    });
  };

  return useMutation(uploadScenarioPUShapefile, {
    onSuccess: (data: any, variables, context) => {
      console.info('Succces', data, variables, context);
    },
    onError: (error, variables, context) => {
      // An error happened!
      console.info('Error', error, variables, context);
    },
  });
}

export function useDownloadCostSurface({
  requestConfig = {
    method: 'GET',
  },
}: UseDownloadScenarioCostSurfaceProps) {
  const [session] = useSession();

  const downloadScenarioCostSurface = ({ id }: DownloadScenarioCostSurfaceProps) => {
    return DOWNLOADS.request({
      url: `/scenarios/${id}/cost-surface/shapefile-template`,
      responseType: 'arraybuffer',
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        'Content-Type': 'application/zip',
      },
      ...requestConfig,
    });
  };

  return useMutation(downloadScenarioCostSurface, {
    onSuccess: (data: any, variables, context) => {
      const { data: blob } = data;
      const { id } = variables;

      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `cost-surface-${id}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      console.info('Succces', data, variables, context);
    },
    onError: (error, variables, context) => {
      // An error happened!
      console.info('Error', error, variables, context);
    },
  });
}

export function useUploadCostSurface({
  requestConfig = {
    method: 'GET',
  },
}: UseUploadScenarioCostSurfaceProps) {
  const [session] = useSession();

  const uploadScenarioCostSurface = ({ id }: UploadScenarioCostSurfaceProps) => {
    return UPLOADS.request({
      url: `/scenarios/${id}/cost-surface/shapefile`,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        'Content-Type': 'multipart/form-data',
      },
      ...requestConfig,
    });
  };

  return useMutation(uploadScenarioCostSurface, {
    onSuccess: (data: any, variables, context) => {
      console.info('Succces', data, variables, context);
    },
    onError: (error, variables, context) => {
      // An error happened!
      console.info('Error', error, variables, context);
    },
  });
}

// PLANNING UNITS
export function useScenarioPU(sid) {
  const [session] = useSession();

  const query = useQuery(['scenarios-pu', sid], async () => SCENARIOS.request({
    method: 'GET',
    url: `/${sid}/planning-units`,
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
    transformResponse: (data) => {
      try {
        return JSON.parse(data);
      } catch (error) {
        return data;
      }
    },
  }).then((response) => {
    return response.data;
  }), {
    enabled: !!sid,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
  });

  const { data } = query;

  return useMemo(() => {
    const parsedData = data || [];
    const included = parsedData
      .filter((p) => p.inclusionStatus === 'locked-in' || p.defaultStatus === 'locked-in')
      .map((p) => p.id);

    const includedDefault = parsedData
      .filter((p) => p.defaultStatus === 'locked-in')
      .map((p) => p.id);

    const excluded = parsedData
      .filter((p) => p.inclusionStatus === 'locked-out' || p.defaultStatus === 'locked-out')
      .map((p) => p.id);

    const excludedDefault = parsedData
      .filter((p) => p.defaultStatus === 'locked-out')
      .map((p) => p.id);

    return {
      ...query,
      data: {
        included,
        excluded,
        includedDefault,
        excludedDefault,
      },
    };
  }, [query, data]);
}

export function useSaveScenarioPU({
  requestConfig = {
    method: 'PATCH',
  },
}: UseSaveScenarioPUProps) {
  const queryClient = useQueryClient();
  const [session] = useSession();

  const saveScenario = ({ id, data }: SaveScenarioPUProps) => {
    return SCENARIOS.request({
      url: `/${id}/planning-units`,
      data,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      ...requestConfig,
    });
  };

  return useMutation(saveScenario, {
    onSuccess: (data: any, variables, context) => {
      console.info('Succces', data, variables, context);
      const { id } = variables;
      queryClient.invalidateQueries(['scenarios-pu', id]);
    },
    onError: (error, variables, context) => {
      console.info('Error', error, variables, context);
    },
  });
}

export function useDuplicateScenario({
  requestConfig = {
    method: 'POST',
  },
}: UseDuplicateScenarioProps) {
  const queryClient = useQueryClient();
  const [session] = useSession();

  const duplicateScenario = ({ id }: DuplicateScenarioProps) => {
    // Pending endpoint
    return SCENARIOS.request({
      url: `/${id}`,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      ...requestConfig,
    });
  };

  return useMutation(duplicateScenario, {
    onSuccess: (data: any, variables, context) => {
      const { id, projectId } = data;
      queryClient.invalidateQueries(['scenarios', projectId]);
      queryClient.invalidateQueries(['scenarios', id]);
      console.info('Succces', data, variables, context);
    },
    onError: (error, variables, context) => {
      // An error happened!
      console.info('Error', error, variables, context);
    },
  });
}

export function useRunScenario({
  requestConfig = {
    method: 'POST',
  },
}: UseRunScenarioProps) {
  const [session] = useSession();

  const duplicateScenario = ({ id }: RunScenarioProps) => {
    // Pending endpoint
    return SCENARIOS.request({
      url: `/${id}/marxan`,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      ...requestConfig,
    });
  };

  return useMutation(duplicateScenario, {
    onSuccess: (data: any, variables, context) => {
      console.info('Succces', data, variables, context);
    },
    onError: (error, variables, context) => {
      // An error happened!
      console.info('Error', error, variables, context);
    },
  });
}

export function useCancelRunScenario({
  requestConfig = {
    method: 'DELETE',
  },
}: UseCancelRunScenarioProps) {
  const [session] = useSession();

  const duplicateScenario = ({ id }: CancelRunScenarioProps) => {
    // Pending endpoint
    return SCENARIOS.request({
      url: `/${id}/marxan`,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      ...requestConfig,
    });
  };

  return useMutation(duplicateScenario, {
    onSuccess: (data: any, variables, context) => {
      console.info('Succces', data, variables, context);
    },
    onError: (error, variables, context) => {
      // An error happened!
      console.info('Error', error, variables, context);
    },
  });
}
