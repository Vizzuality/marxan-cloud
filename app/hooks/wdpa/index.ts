import { useMemo } from 'react';

import { useQuery } from 'react-query';

import { useSession } from 'next-auth/client';

import WDPA from 'services/wdpa';

import { UseWDPACategoriesProps } from './types';

export function useWDPACategories({ adminAreaId, customAreaId }: UseWDPACategoriesProps) {
  const [session] = useSession();

  const query = useQuery(['wdpa-categories', adminAreaId, customAreaId], async () => WDPA.request({
    method: 'GET',
    url: '/iucn-categories',
    params: {
      ...adminAreaId && {
        'filter[adminAreaId]': adminAreaId,
      },
      ...customAreaId && {
        'filter[customAreaId]': customAreaId,
      },
    },
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  }), {
    enabled: !!adminAreaId || !!customAreaId,
  });

  const { data } = query;

  return useMemo(() => {
    return {
      ...query,
      data: data?.data?.data,
    };
  }, [query, data?.data?.data]);
}
