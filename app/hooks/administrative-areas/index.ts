import { useQuery } from 'react-query';

import { useSession } from 'next-auth/react';

import { SubRegion } from 'types/location';

import ADMINISTRATIVE_AREAS from 'services/administrative-areas';

export function useAdministrativeAreas(props: { id: string; includeAll?: boolean }) {
  const { data: session } = useSession();
  const { includeAll, id } = props;

  return useQuery(
    ['administrative areas', id],
    async () =>
      ADMINISTRATIVE_AREAS.request<{ data: SubRegion[] }>({
        method: 'GET',
        url: `/${id}/subdivisions`,
        params: {
          'page[size]': includeAll ? 6000 : 25,
          omitFields: 'theGeom',
          sort: 'name2',
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
          name: r.name2,
          id: r.id,
          level: 2,
          bbox: r.bbox,
          minPuAreaSize: r.minPuAreaSize,
          maxPuAreaSize: r.maxPuAreaSize,
        }));
      },
    }
  );
}
