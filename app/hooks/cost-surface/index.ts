import { useQuery, QueryObserverOptions, useMutation } from 'react-query';

import { useSession } from 'next-auth/react';

import { CostSurface } from 'types/api/cost-surface';
import { Project } from 'types/api/project';

import { API, JSONAPI } from 'services/api';
import UPLOADS from 'services/uploads';

export function useProjectCostSurfaces<T = CostSurface[]>(
  pid: Project['id'],
  params: { sort?: string } = {},
  queryOptions: QueryObserverOptions<CostSurface[], Error, T> = {}
) {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ['cost-surfaces', pid],
    queryFn: async () =>
      JSONAPI.request<{ data: CostSurface[] }>({
        method: 'GET',
        url: `/projects/${pid}/cost-surfaces`,
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
        params,
      }).then(({ data }) => data?.data),
    enabled: Boolean(pid),
    ...queryOptions,
  });
}

export function useProjectCostSurface<T = CostSurface>(
  pid: Project['id'],
  csid: CostSurface['id'],
  queryOptions: QueryObserverOptions<CostSurface, Error, T> = {}
) {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ['cost-surface', csid],
    queryFn: async () =>
      JSONAPI.request<{ data: CostSurface }>({
        method: 'GET',
        url: `/projects/${pid}/cost-surfaces/${csid}`,
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      }).then(({ data }) => data?.data),
    enabled: Boolean(csid),
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
      url: `/projects/${id}/cost-surfaces/shapefile`,
      data,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        'Content-Type': 'multipart/form-data',
      },
    });
  };

  return useMutation(uploadProjectCostSurface);
}
