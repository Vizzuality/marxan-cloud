import { useMutation, useQuery, QueryObserverOptions, useQueryClient } from 'react-query';

import { AxiosRequestConfig } from 'axios';
import { useSession } from 'next-auth/react';

import { Project } from 'types/api/project';
import { Scenario } from 'types/api/scenario';
import { WDPA, WDPACategory } from 'types/api/wdpa';

import { API } from 'services/api';
import GEOFEATURES from 'services/geo-features';
import PROJECTS from 'services/projects';
import SCENARIOS from 'services/scenarios';

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
  params: { sort?: string } = {},
  queryOptions: QueryObserverOptions<WDPA[], Error, T> = {}
) {
  const { data: session } = useSession();

  const mockData: WDPA[] = [
    {
      id: 'Not Reported',
      wdpaId: 'Not Reported',
      fullName: 'Not Reported',
      iucnCategory: 'IUCN Category',
      countryId: 'hgdfjkd',
      shapeLength: 45,
      shapeArea: 30,
      status: 'done',
      designation: 'd',
      scenarioUsageCount: 3,
    },
    {
      id: 'IV',
      wdpaId: 'IV',
      fullName: 'IUCN IV',
      iucnCategory: 'IUCN IV',
      countryId: 'mdfgjf',
      shapeLength: 45,
      shapeArea: 30,
      status: 'done',
      designation: 'd',
      scenarioUsageCount: 0,
    },
    {
      id: 'II',
      wdpaId: 'II',
      fullName: 'Florida scrub jay',
      iucnCategory: 'IUCN II',
      countryId: 'mdfgjf',
      shapeLength: 45,
      shapeArea: 30,
      status: 'done',
      designation: 'd',
      scenarioUsageCount: 0,
    },
  ];

  return useQuery({
    queryKey: ['wdpas', pid],
    queryFn: async () =>
      API.request<WDPA[]>({
        method: 'GET',
        url: `/projects/${pid}/protected-areas`,
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
        params,
      }).then(({ data }) => mockData),
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
