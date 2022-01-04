import { useMemo } from 'react';

import { useMutation, useQuery } from 'react-query';

import { useSession } from 'next-auth/client';

import SCENARIOS from 'services/scenarios';
import WDPA from 'services/wdpa';

import {
  UseWDPACategoriesProps,
  UseSaveScenarioProtectedAreasProps,
  SaveScenarioProtectedAreasProps,
} from './types';

export function useWDPACategories({
  scenarioId,
}: UseWDPACategoriesProps) {
  const [session] = useSession();

  const query = useQuery(
    'scenarios',
    async () => WDPA.request({
      method: 'GET',
      url: `/${scenarioId}/protected-areas`,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    }),
  );

  const { data } = query;

  return useMemo(() => {
    return {
      ...query,
      data: data?.data?.data,
    };
  }, [query, data?.data?.data]);
}

export function useSaveScenarioProtectedAreas({
  requestConfig = {
    method: 'POST',
  },
}: UseSaveScenarioProtectedAreasProps) {
  const [session] = useSession();

  const saveScenarioProtectedAreas = ({ id, data }: SaveScenarioProtectedAreasProps) => {
    return SCENARIOS.request({
      url: `/${id}/protected-areas`,
      data,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      ...requestConfig,
    });
  };

  return useMutation(saveScenarioProtectedAreas, {
    onSuccess: (data: any, variables, context) => {
      console.info('Succces', data, variables, context);
    },
    onError: (error, variables, context) => {
      console.info('Error', error, variables, context);
    },
  });
}
