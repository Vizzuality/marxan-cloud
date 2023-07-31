import { useQuery } from 'react-query';

import { useSession } from 'next-auth/react';

import { Country, Region, RegionLevel } from 'types/location';

import COUNTRIES from 'services/countries';

export function useCountries(filters: { includeAll?: boolean }) {
  const { data: session } = useSession();
  const { includeAll } = filters;

  return useQuery(
    ['countries'],
    async () =>
      COUNTRIES.request<{ data: Country[] }>({
        method: 'GET',
        params: {
          ...(includeAll && { disablePagination: true }),
          sort: 'name0',
          omitFields: 'theGeom',
        },
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      }),
    {
      select: (data) => {
        const parsedData = Array.isArray(data?.data?.data) ? data?.data?.data : [];

        return parsedData.map((c) => ({
          name: c.name0,
          id: c.gid0,
          bbox: c.bbox,
          minPuAreaSize: c.minPuAreaSize,
          maxPuAreaSize: c.maxPuAreaSize,
        }));
      },
    }
  );
}

export function useCountryRegions(props: {
  id: Region['id'];
  includeAll?: boolean;
  level: RegionLevel;
}) {
  const { data: session } = useSession();
  const { includeAll, id, level } = props;

  return useQuery(
    ['country regions', id],
    async () =>
      COUNTRIES.request<{ data: Region[] }>({
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
      }),
    {
      enabled: !!id,
      select: (data) => {
        const parsedData = Array.isArray(data?.data?.data) ? data?.data?.data : [];

        return parsedData.map((r) => ({
          name: r.name1,
          id: r.id,
          level: 1,
          bbox: r.bbox,
          minPuAreaSize: r.minPuAreaSize,
          maxPuAreaSize: r.maxPuAreaSize,
        }));
      },
    }
  );
}
