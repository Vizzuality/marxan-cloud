import { useMutation, useQuery, QueryObserverOptions, useQueryClient } from 'react-query';

import { AxiosRequestConfig } from 'axios';
import { useSession } from 'next-auth/react';

import { Project } from 'types/api/project';
import { Scenario } from 'types/api/scenario';
import { WDPA, WDPACategory } from 'types/api/wdpa';

import { API } from 'services/api';
import PROJECTS from 'services/projects';
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
      API.request<WDPACategory[]>({
        method: 'GET',
        url: `/scenarios/${scenarioId}/protected-areas`,
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
      select: ({ data }) => data,
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
  params: { search?: string; sort?: string; filters?: Record<string, unknown> } = {},
  queryOptions: QueryObserverOptions<WDPA[], Error, T> = {}
) {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ['wdpas', pid],
    queryFn: async () =>
      API.request<{ data: WDPA[] }>({
        method: 'GET',
        url: `/projects/${pid}/protected-areas`,
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
        params,
      }).then(({ data }) => data.data),
    enabled: Boolean(pid),
    ...queryOptions,
  });
}

export function useEditWDPA({
  requestConfig = {
    method: 'PATCH',
  },
}) {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  const saveProjectWDPA = ({
    projectId,
    wdpaId,
    data,
  }: {
    projectId: string;
    wdpaId: string;
    data: { fullName: string };
  }) => {
    return PROJECTS.request({
      method: 'PATCH',
      url: `/${projectId}/protected-areas/${wdpaId}`,
      data,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      ...requestConfig,
    });
  };

  return useMutation(saveProjectWDPA, {
    onSuccess: async (data, variables) => {
      const { projectId } = variables;
      await queryClient.invalidateQueries(['wdpas', projectId]);
    },
    onError: (error, variables, context) => {
      console.info('Error', error, variables, context);
    },
  });
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
