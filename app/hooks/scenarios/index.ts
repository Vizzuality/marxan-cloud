import flatten from 'lodash/flatten';
import { useMemo, useRef } from 'react';
import {
  useQuery, useInfiniteQuery, useMutation, useQueryClient,
} from 'react-query';
import { useSession } from 'next-auth/client';
import { useRouter } from 'next/router';

import { formatDistanceToNow } from 'date-fns';

import { ItemProps } from 'components/scenarios/item/component';

import SCENARIOS from 'services/scenarios';
import UPLOADS from 'services/uploads';

import {
  UseScenariosOptionsProps,
  UseSaveScenarioProps,
  SaveScenarioProps,
  UseDeleteScenarioProps,
  DeleteScenarioProps,
} from './types';

export function useScenarios(pId, options: UseScenariosOptionsProps = {}) {
  const [session] = useSession();
  const { push } = useRouter();

  const placeholderDataRef = useRef({
    pages: [],
    pageParams: [],
  });

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
    placeholderData: placeholderDataRef.current,
    getNextPageParam: (lastPage) => {
      const { data: { meta } } = lastPage;
      const { page, totalPages } = meta;

      const nextPage = page + 1 > totalPages ? null : page + 1;
      return nextPage;
    },
  });

  const { data } = query;
  const { pages } = data || {};

  if (data) {
    placeholderDataRef.current = data;
  }

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
  }), {
    enabled: !!id,
  });

  const { data } = query;

  return useMemo(() => {
    return {
      ...query,
      data: data?.data?.data,
    };
  }, [query, data?.data?.data]);
}

export function useSaveScenario({
  requestConfig = {
    method: 'POST',
  },
}: UseSaveScenarioProps) {
  const queryClient = useQueryClient();
  const [session] = useSession();

  const saveScenario = ({ id, data }: SaveScenarioProps) => {
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

export function useSaveScenarioPUShapefile({
  requestConfig = {
    method: 'POST',
  },
}: UseSaveScenarioProps) {
  const [session] = useSession();

  const saveScenarioPUShapefile = ({ id, data }: SaveScenarioProps) => {
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

  return useMutation(saveScenarioPUShapefile, {
    onSuccess: (data: any, variables, context) => {
      console.info('Succces', data, variables, context);
    },
    onError: (error, variables, context) => {
      // An error happened!
      console.info('Error', error, variables, context);
    },
  });
}
