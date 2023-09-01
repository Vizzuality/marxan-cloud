import { useQuery, QueryObserverOptions, useMutation } from 'react-query';

import { useSession } from 'next-auth/react';

import { CostSurface } from 'types/api/cost-surface';
import { Project } from 'types/api/project';

import { API } from 'services/api';
import UPLOADS from 'services/uploads';

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
      isCustom: true,
      scenarioUsageCount: 3,
    },
    {
      id: 'rfjghhrtersdtbkjshfw',
      name: 'Cost Surface Rwanda B',
      isCustom: true,
      scenarioUsageCount: 0,
    },
    {
      id: '23275455HGVVCMSJHDFk',
      name: 'Cost Surface Rwanda C',
      isCustom: true,
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

export function useEditProjectCostSurface() {
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

export function useUploadProjectCostSurface() {
  const { data: session } = useSession();

  const uploadProjectCostSurface = ({ id, data }: { id: CostSurface['id']; data: FormData }) => {
    return UPLOADS.request({
      method: 'POST',
      // TODO: change this to the correct endpoint
      url: `/projects/${id}/cost-surface/shapefile`,
      data,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        'Content-Type': 'multipart/form-data',
      },
    });
  };

  return useMutation(uploadProjectCostSurface);
}
