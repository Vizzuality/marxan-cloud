import { useMemo } from 'react';

import { useQuery } from 'react-query';

import { useSession } from 'next-auth/client';

import WDPA from 'services/wdpa';

export function useWDPACategories(adminAreaId) {
  const [session] = useSession();

  const query = useQuery(['wdpa-categories', adminAreaId], async () => WDPA.request({
    method: 'GET',
    url: '/iucn-categories',
    params: {
      'filter[adminAreaId]': adminAreaId,
    },
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  }), {
    enabled: !!adminAreaId,
  });

  const { data } = query;

  return useMemo(() => {
    return {
      ...query,
      data: data?.data?.data,
    };
  }, [query, data?.data?.data]);
}
