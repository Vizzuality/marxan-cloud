import { useMemo } from 'react';
import { useQuery } from 'react-query';
import { useAuth } from 'hooks/authentication';

import { Country, Region } from 'types/country-model';

import COUNTRIES from 'services/countries';
import {
  UseCountriesProps,
  UseCountriesResponse,
  UseCountryRegionsProps,
  UseCountryRegionsResponse,
} from './types';

export function useCountries(filters: UseCountriesProps): UseCountriesResponse {
  const { user } = useAuth();
  const { includeAll } = filters;

  const query = useQuery('countries', async () => COUNTRIES.request({
    method: 'GET',
    url: '/',
    params: {
      'page[size]': includeAll ? 0 : 25,
      fields: 'gid0,name0',
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

export function useCountryRegions(props: UseCountryRegionsProps): UseCountryRegionsResponse {
  const { user } = useAuth();
  const { includeAll, id } = props;

  console.log('id', id);

  const query = useQuery('country regions', async () => COUNTRIES.request({
    method: 'GET',
    url: `/${id}/administrative-areas`,
    params: {
      'page[size]': includeAll ? 0 : 25,
    },
    headers: {
      Authorization: `Bearer ${user.token}`,
    },
  }), {
    enabled: !!id,
  });

  const { data } = query;

  return useMemo(() => {
    const parsedData = Array.isArray(data?.data) ? data?.data : [];
    console.log('parsedData Regions', parsedData);

    const regions: Region[] = parsedData.map((r) => ({
      name: r.name1,
      id: r.id,
    }));

    return {
      ...query,
      data: regions,
    };
    // eslint-disable-next-line no-else-return
  }, [query, data?.data]);
}
