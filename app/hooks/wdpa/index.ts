import { useMemo } from 'react';

import { useQuery } from 'react-query';

import { useSession } from 'next-auth/client';

import WDPA from 'services/wdpa';

import { UseWDPACategoriesProps } from './types';

export function useWDPACategories({
  adminAreaId,
  customAreaId,
  scenarioId,
}: UseWDPACategoriesProps) {
  const [session] = useSession();

  const query = useQuery(
    ['scenarios', adminAreaId, customAreaId],
    async () => WDPA.request({
      method: 'GET',
      url: `/${scenarioId}/protected-areas`,
      params: {
        ...(adminAreaId && {
          'filter[adminAreaId]': adminAreaId,
        }),
        ...(customAreaId && {
          'filter[customAreaId]': customAreaId,
        }),
      },
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    }),
    {
      enabled: !!adminAreaId || !!customAreaId,
      refetchInterval: 1000,
    },
  );

  const { data } = query;

  return useMemo(() => {
    return {
      ...query,
      data: data?.data?.data,
    };
  }, [query, data?.data?.data]);
}
