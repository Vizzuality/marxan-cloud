import { useMutation, useQuery, QueryObserverOptions, useQueryClient } from 'react-query';

import { AxiosRequestConfig } from 'axios';
import { useSession } from 'next-auth/react';

import { Project } from 'types/api/project';
import { Scenario } from 'types/api/scenario';
import { WDPA } from 'types/api/wdpa';

import { API, JSONAPI } from 'services/api';
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
    ['protected-areas', adminAreaId, customAreaId, scenarioId],
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
          disablePagination: true,
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

export function useProjectWDPAs<T = WDPA[]>(
  pid: Project['id'],
  params: { search?: string; sort?: string } = {},
  queryOptions: QueryObserverOptions<WDPA[], Error, T> = {}
) {
  const { data: session } = useSession();

  const { search, sort } = params;

  const fetchProjectWDPAs = () =>
    JSONAPI.request<{ data: WDPA[] }>({
      method: 'GET',
      url: `/projects/${pid}/protected-areas`,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      params: {
        ...(search && {
          q: search,
        }),
        ...(sort && {
          sort,
        }),
        disablePagination: true,
      },
    }).then(({ data }) => data.data);

  return useQuery({
    queryKey: ['wdpas', pid, JSON.stringify(params)],
    queryFn: fetchProjectWDPAs,
    ...queryOptions,
  });
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
