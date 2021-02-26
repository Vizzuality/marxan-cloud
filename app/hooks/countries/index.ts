import { useMemo } from 'react';
import { useQuery } from 'react-query';
import { useAuth } from 'hooks/authentication';

import { Country } from 'types/country-model';

import COUNTRIES from 'services/countries';
import { UseCountriesResponse } from './types';

export function useCountries(filters): UseCountriesResponse {
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
    const countries: Country[] = parsedData.map((c) => ({
      name: c.name0,
      id: c.gid0,
    }));

    return {
      ...query,
      data: countries,
    };
  }, [query, data?.data]);
}
