import { useQuery, QueryObserverOptions, useMutation } from 'react-query';

import { useSession } from 'next-auth/react';

import { CostSurface } from 'types/api/cost-surface';
import { Project } from 'types/api/project';

import { API } from 'services/api';

export function useProjectCostSurfaces<T = CostSurface[]>(
  pid: Project['id'],
  params: { search?: string; sort?: string; filters?: Record<string, unknown> } = {},
  queryOptions: QueryObserverOptions<CostSurface[], Error, T> = {}
) {
  const { data: session } = useSession();

  const mockData: CostSurface[] = [
    {
      id: 'gfehrtf22534geyg',
      name: 'Cost Surface Rwanda A',
      scenarioUsageCount: 3,
    },
    {
      id: 'rfjghhrtersdtbkjshfw',
      name: 'Cost Surface Rwanda B',
      scenarioUsageCount: 0,
    },
    {
      id: '23275455HGVVCMSJHDFk',
      name: 'Cost Surface Rwanda C',
      scenarioUsageCount: 0,
    },
  ];

  return useQuery({
    queryKey: ['cost-surfaces', pid],
    queryFn: async () =>
      API.request<CostSurface[]>({
        method: 'GET',
        // !TODO: change this to the correct endpoint
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

export function useEditCostSurface() {
  const { data: session } = useSession();

  const editCostSurface = ({
    costSurfaceId,
    projectId,
    body = {},
  }: {
    costSurfaceId: CostSurface['id'];
    projectId: Project['id'];
    body: Record<string, unknown>;
  }) => {
    // TODO: change this to the correct endpoint
    return API.patch<CostSurface>(
      `projects/${projectId}/cost-surfaces/${costSurfaceId}`,
      {
        ...body,
      },
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      }
    );
  };

  return useMutation(editCostSurface);
}
