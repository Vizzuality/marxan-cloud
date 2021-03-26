import Fuse from 'fuse.js';
import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useSession } from 'next-auth/client';
import { useRouter } from 'next/router';

import orderBy from 'lodash/orderBy';

import { formatDistanceToNow } from 'date-fns';

import { ItemProps } from 'components/scenarios/item/component';

import SCENARIOS from 'services/scenarios';

import {
  UseScenariosFiltersProps,
  UseSaveScenarioProps,
  SaveScenarioProps,
  UseDeleteScenarioProps,
  DeleteScenarioProps,
} from './types';

export function useScenarios(pId, filters: UseScenariosFiltersProps = {}) {
  const [session] = useSession();
  const { search } = filters;
  const { push } = useRouter();

  const query = useQuery(['scenarios', pId], async () => SCENARIOS.request({
    method: 'GET',
    url: '/',
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
    params: {
      'filter[projectId]': pId,
    },
  }));

  const { data } = query;

  return useMemo(() => {
    let parsedData = Array.isArray(data?.data) ? data?.data.map((d):ItemProps => {
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
        onSettings: () => {

        },
      };
    }) : [];

    // Filter
    if (search) {
      const fuse = new Fuse(parsedData, {
        keys: ['name'],
        threshold: 0.25,
      });
      parsedData = fuse.search(search).map((f) => {
        return f.item;
      });
    }

    // Sort
    parsedData = orderBy(parsedData, ['lastUpdate'], ['desc']);

    return {
      ...query,
      data: parsedData,
      rawData: data?.data,
    };
  }, [query, data?.data, search, push]);
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
  const queryClient = useQueryClient();
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
      queryClient.invalidateQueries('scenarios');
      console.info('Succces', data, variables, context);
    },
    onError: (error, variables, context) => {
      // An error happened!
      console.info('Error', error, variables, context);
    },
  });
}
