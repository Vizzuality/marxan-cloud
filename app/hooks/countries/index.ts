import { useMemo } from 'react';

import { useQuery } from 'react-query';

import { useSession } from 'next-auth/client';
import { Country, Region } from 'types/country-model';

import COUNTRIES from 'services/countries';

import {
  UseCountriesProps,
  UseCountriesResponse,
  UseCountryRegionsProps,
  UseCountryRegionsResponse,
} from './types';

export function useCountries(filters: UseCountriesProps): UseCountriesResponse {
  const [session] = useSession();
  const { includeAll } = filters;

  const query = useQuery('countries', async () => COUNTRIES.request({
    method: 'GET',
    url: '/',
    params: {
      ...(includeAll && { disablePagination: true }),
      sort: 'name0',
      omitFields: 'theGeom',
    },
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  }));

  const { data } = query;

  return useMemo(() => {
    const parsedData = Array.isArray(data?.data?.data) ? data?.data?.data : [];

    const countries: Country[] = parsedData.map((c) => ({
      name: c.name0,
      id: c.gid0,
      bbox: c.bbox,
      minPuAreaSize: c.minPuAreaSize,
      maxPuAreaSize: c.maxPuAreaSize,
    }));

    return {
      ...query,
      data: countries,
    };
  }, [query, data?.data?.data]);
}

export function useCountryRegions(props: UseCountryRegionsProps): UseCountryRegionsResponse {
  const [session] = useSession();
  const { includeAll, id, level } = props;

  const query = useQuery(['country regions', id], async () => COUNTRIES.request({
    method: 'GET',
    url: `/${id}/administrative-areas`,
    params: {
      'page[size]': includeAll ? 0 : 25,
      level,
      omitFields: 'theGeom',
      sort: 'name1',
    },
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  }), {
    enabled: !!id,
  });

  const { data } = query;

  return useMemo(() => {
    const parsedData = Array.isArray(data?.data?.data) ? data?.data?.data : [];

    const regions: Region[] = parsedData.map((r) => ({
      name: r.name1,
      id: r.id,
      level: 1,
      bbox: r.bbox,
      minPuAreaSize: r.minPuAreaSize,
      maxPuAreaSize: r.maxPuAreaSize,
    }));

    return {
      ...query,
      data: regions,
    };
  }, [query, data?.data?.data]);
}
