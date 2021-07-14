import { useMemo } from 'react';
import { useQuery } from 'react-query';
import { useSession } from 'next-auth/client';

import { Region } from 'types/country-model';

import ADMINISTRATIVE_AREAS from 'services/administrative-areas';

import {
  UseAdministrativeAreasProps,
  UseAdministrativeAreasResponse,
} from './types';

export function useAdministrativeAreas(props: UseAdministrativeAreasProps):
UseAdministrativeAreasResponse {
  const [session] = useSession();
  const { includeAll, id } = props;

  const query = useQuery(['administrative areas', id], async () => ADMINISTRATIVE_AREAS.request({
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
  }), {
    enabled: !!id,
  });

  const { data } = query;

  return useMemo(() => {
    const parsedData = Array.isArray(data?.data?.data) ? data?.data?.data : [];

    const regions: Region[] = parsedData.map((r) => ({
      name: r.name2,
      id: r.id,
      level: 2,
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
