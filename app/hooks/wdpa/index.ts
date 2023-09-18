import { useMemo } from 'react';

import {
  useMutation,
  useQuery,
  QueryObserverOptions,
  useQueryClient,
  useInfiniteQuery,
} from 'react-query';

import { AxiosRequestConfig } from 'axios';
import { useSession } from 'next-auth/react';

import { Project } from 'types/api/project';
import { Scenario } from 'types/api/scenario';
import { WDPA } from 'types/api/wdpa';

import { API } from 'services/api';
import SCENARIOS from 'services/scenarios';
import UPLOADS from 'services/uploads';

export function useWDPACategories({
  adminAreaId,
  customAreaId,
  scenarioId,
}: {
  adminAreaId?: WDPA['id'];
  customAreaId?: WDPA['id'];
  scenarioId: Scenario['id'];
}) {
  const { data: session } = useSession();

  return useQuery(
    ['protected-areas', adminAreaId, customAreaId],
    async () =>
      API.request({
        method: 'GET',
        url: `scenarios/${scenarioId}/protected-areas`,
        params: {
          ...(adminAreaId && {
            'filter[adminAreaId]': adminAreaId,
          }),
          ...(customAreaId && {
            'filter[customAreaId]': customAreaId,
          }),
        },
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      }).then(({ data }) => data),
    {
      enabled: !!adminAreaId || !!customAreaId,
    }
  );
}

export function useSaveScenarioProtectedAreas({
  requestConfig = {
    method: 'POST',
  },
}: {
  requestConfig?: AxiosRequestConfig;
}) {
  const { data: session } = useSession();

  const saveScenarioProtectedAreas = ({
    id,
    data,
  }: {
    id: Scenario['id'];
    data: {
      areas: {
        id: string;
        selected: boolean;
      }[];
      threshold: number;
    };
  }) => {
    return SCENARIOS.request({
      url: `/${id}/protected-areas`,
      data,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      ...requestConfig,
    });
  };

  return useMutation(saveScenarioProtectedAreas);
}

export function useProjectWDPAs(
  pid: Project['id'],
  params: { search?: string; sort?: string } = {}
) {
  const { data: session } = useSession();

  const { search, sort } = params;

  const fetchProjectWDPAs = ({ pageParam = 1 }) =>
    API.request({
      method: 'GET',
      url: `/projects/${pid}/protected-areas`,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      params: {
        'page[number]': pageParam,
        ...(search && {
          q: search,
        }),
        ...(sort && {
          sort,
        }),
      },
    });

  const query = useInfiniteQuery(['wdpas', pid, JSON.stringify(params)], fetchProjectWDPAs, {
    retry: false,
    keepPreviousData: true,
    getNextPageParam: (lastPage) => {
      const {
        data: { meta },
      } = lastPage;
      const { page, totalPages } = meta;

      const nextPage = page + 1 > totalPages ? null : page + 1;
      return nextPage;
    },
  });

  return useMemo(() => {
    const { data } = query;

    const { pages } = data || {};

    const parsedData = Array.isArray(pages) && pages.length > 0 ? pages[0].data.data : [];

    return {
      ...query,
      data: parsedData,
    };
  }, [query]);
}

export function useEditWDPA({
  requestConfig = {
    method: 'PATCH',
  },
}) {
  const { data: session } = useSession();

  const saveProjectWDPA = ({ wdpaId, data }: { wdpaId: string; data: { name: string } }) => {
    return API.request({
      method: 'PATCH',
      url: `/protected-areas/${wdpaId}`,
      data,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      ...requestConfig,
    });
  };

  return useMutation(saveProjectWDPA);
}

export function useUploadWDPAsShapefile({
  requestConfig = {
    method: 'POST',
  },
}: {
  requestConfig?: AxiosRequestConfig<FormData>;
}) {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  const uploadWDPAShapefile = ({ id, data }: { id: Project['id']; data: FormData }) => {
    return UPLOADS.request<{ success: true }>({
      url: `/projects/${id}/protected-areas/shapefile`,
      data,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        'Content-Type': 'multipart/form-data',
      },
      ...requestConfig,
    } as typeof requestConfig);
  };

  return useMutation(uploadWDPAShapefile, {
    onSuccess: async (data, variables) => {
      const { id: projectId } = variables;
      await queryClient.invalidateQueries(['wdpas', projectId]);
    },
  });
}
