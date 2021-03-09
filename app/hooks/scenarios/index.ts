import { useMemo } from 'react';
import { useQuery, useMutation } from 'react-query';
import { useSession } from 'next-auth/client';

import SCENARIOS from 'services/scenarios';

import { UseSaveScenarioProps } from './types';

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
    url: '/',
  },
}: UseSaveScenarioProps) {
  const [session] = useSession();

  return useMutation((data) => {
    return SCENARIOS.request({
      method: 'POST',
      url: '/',
      data,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
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
