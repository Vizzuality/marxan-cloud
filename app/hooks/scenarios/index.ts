import { useMemo } from 'react';
import { useQuery, useMutation } from 'react-query';
import { useAuth } from 'hooks/authentication';

import SCENARIOS from 'services/scenarios';

import { UseSaveScenarioProps } from './types';

export function useScenarios() {
  const { user } = useAuth();

  const query = useQuery('scenarios', async () => SCENARIOS.request({
    method: 'GET',
    url: '/',
    headers: {
      Authorization: `Bearer ${user.token}`,
    },
  }));

  return query;
}

export function useScenario(id: string) {
  const { user } = useAuth();

  const query = useQuery(`scenarios/${id}`, async () => SCENARIOS.request({
    method: 'GET',
    url: `/${id}`,
    headers: {
      Authorization: `Bearer ${user.token}`,
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
    url: '/',
  },
}: UseSaveScenarioProps) {
  const { user } = useAuth();

  return useMutation((data) => {
    return SCENARIOS.request({
      method: 'POST',
      url: '/',
      data,
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
      ...requestConfig,
    });
  }, {
    onSuccess: (data, variables, context) => {
      console.info('Succces', data, variables, context);
    },
    onError: (error, variables, context) => {
      // An error happened!
      console.info('Error', error, variables, context);
    },
  });
}
