import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useSession } from 'next-auth/client';

import SCENARIOS from 'services/scenarios';

import {
  UseSaveScenarioProps,
  SaveScenarioProps,
  UseDeleteScenarioProps,
  DeleteScenarioProps,
} from './types';

export function useScenarios() {
  const [session] = useSession();

  const query = useQuery('scenarios', async () => SCENARIOS.request({
    method: 'GET',
    url: '/',
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  }));

  return query;
}

export function useScenario(id) {
  const [session] = useSession();

  const query = useQuery(`scenarios/${id}`, async () => SCENARIOS.request({
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
