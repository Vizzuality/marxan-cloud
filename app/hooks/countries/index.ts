import { useMemo } from 'react';
import { useQuery } from 'react-query';
import { useAuth } from 'hooks/authentication';

import COUNTRIES from 'services/projects';

export function useCountries(filters) {
  const { user } = useAuth();
  const { includeAll } = filters;

  const query = useQuery('countries', async () => COUNTRIES.request({
    method: 'GET',
    url: '/',
    params: {
      'page[size]': includeAll ? 0 : 25,
    },
    headers: {
      Authorization: `Bearer ${user.token}`,
    },
  }));

  const { data } = query;

  return useMemo(() => {
    const parsedData = Array.isArray(data?.data) ? data?.data : [];

    return {
      ...query,
      data: parsedData,
    };
  }, [query, data?.data]);
}
