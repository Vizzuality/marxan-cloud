import { useMemo } from 'react';
import { useQuery } from 'react-query';
import { useAuth } from 'hooks/authentication';

import { Region } from 'types/country-model';

import ADMINISTRATIVE_AREAS from 'services/administrative-areas';

import {
  UseAdministrativeAreasProps,
  UseAdministrativeAreasResponse,
} from './types';

export function useAdministrativeAreas(props: UseAdministrativeAreasProps):
UseAdministrativeAreasResponse {
  const { user } = useAuth();
  const { includeAll, id } = props;

  const query = useQuery(['administrative areas', id], async () => ADMINISTRATIVE_AREAS.request({
    method: 'GET',
    url: `/${id}/subdivisions`,
    params: {
      'page[size]': includeAll ? 6000 : 25,
      omitFields: 'theGeom',
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

    const regions: Region[] = parsedData.map((r) => ({
      name: r.name2,
      id: r.id,
      level: 2,
    }));

    return {
      ...query,
      data: regions,
    };
  }, [query, data?.data]);
}
