import { useMemo } from 'react';

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from 'react-query';

import { useRouter } from 'next/router';

import axios from 'axios';
import { formatDistance } from 'date-fns';
import flatten from 'lodash/flatten';
import orderBy from 'lodash/orderBy';
import { useSession } from 'next-auth/react';

import { ItemProps } from 'layout/projects/all/list/item/component';
import { Project } from 'types/api/project';
import { createDownloadLink } from 'utils/download';

import PROJECTS from 'services/projects';
import UPLOADS from 'services/uploads';

import {
  UseProjectsOptionsProps,
  UseSaveProjectProps,
  SaveProjectProps,
  UseDeleteProjectProps,
  DeleteProjectProps,
  UseUploadProjectPAProps,
  UploadProjectPAProps,
  UseDuplicateProjectProps,
  DuplicateProjectProps,
  UseUploadProjectPAGridProps,
  UploadProjectPAGridProps,
  UsePublishProjectProps,
  PublishProjectProps,
  UseDownloadExportProps,
  DownloadExportProps,
  UseUnPublishProjectProps,
  UnPublishProjectProps,
  UseExportProjectProps,
  ExportProjectProps,
  ImportProjectProps,
  UseImportProjectProps,
  UseSaveLegacyProjectProps,
  SaveLegacyProjectProps,
  UseCancelImportLegacyProjectProps,
  CancelImportLegacyProjectProps,
  UseImportLegacyProjectProps,
  ImportLegacyProjectProps,
  UseUploadLegacyProjectFileProps,
  UploadLegacyProjectFileProps,
  UseCancelUploadLegacyProjectFileProps,
  CancelUploadLegacyProjectFileProps,
  UseLegacyProjectValidationResultsProps,
  LegacyProjectValidationResultsProps,
} from './types';

export function useProjects(options: UseProjectsOptionsProps) {
  const { push } = useRouter();
  const { data: session } = useSession();

  const { filters = {}, search, sort = '-lastModifiedAt' } = options;

  const parsedFilters = Object.keys(filters).reduce((acc, k) => {
    return {
      ...acc,
      [`filter[${k}]`]: filters[k].toString(),
    };
  }, {});

  const fetchProjects = ({ pageParam = 1 }) =>
    PROJECTS.request({
      method: 'GET',
      url: '/',
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      params: {
        'page[number]': pageParam,
        include: 'scenarios,users',
        ...parsedFilters,
        ...(search && {
          q: search,
        }),
        ...(sort && {
          sort,
        }),
      },
    });

  const query = useInfiniteQuery(['projects', JSON.stringify(options)], fetchProjects, {
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

  const { data } = query;
  const { pages } = data || {};

  return useMemo(() => {
    let parsedData = Array.isArray(pages)
      ? flatten(
          pages.map((p) => {
            const {
              data: { data: pageData },
            } = p;

            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return pageData.map((d): ItemProps => {
              const {
                id,
                name,
                description,
                lastModifiedAt,
                scenarios,
                planningAreaName,
                isPublic,
                publicMetadata,
              } = d;

              const lastUpdate = scenarios.reduce((acc, s) => {
                const { lastModifiedAt: slastModifiedAt } = s;

                return slastModifiedAt > acc ? slastModifiedAt : acc;
              }, lastModifiedAt);

              const lastUpdateDistance = () => {
                return formatDistance(new Date(lastUpdate || null), new Date(), {
                  addSuffix: true,
                });
              };

              return {
                id,
                area: planningAreaName || 'Custom area name',
                name,
                description,
                lastUpdate,
                lastUpdateDistance: lastUpdateDistance(),
                contributors: [],
                isPublic,
                scenarios,
                underModeration: publicMetadata?.underModeration,
                onClick: () => {
                  push(`/projects/${id}`);
                },
                onDownload: (e) => {
                  console.info('onDownload', e);
                },
                onDuplicate: (e) => {
                  console.info('onDuplicate', e);
                },
                onDelete: (e) => {
                  console.info('onDelete', e);
                },
              };
            });
          })
        )
      : [];

    // Sort
    parsedData = orderBy(parsedData, ['lastUpdate'], ['desc']);

    return {
      ...query,
      data: parsedData,
    };
  }, [query, pages, push]);
}

export function useProject(id: Project['id']) {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ['project', id],
    queryFn: async () =>
      PROJECTS.request<{ data: Partial<Project> }>({
        method: 'GET',
        url: `/${id}`,
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
        params: {
          include: 'scenarios,users',
        },
      }).then((response) => response.data.data),
    enabled: !!id,
    placeholderData: {},
  });
}

export function useSaveProject({
  requestConfig = {
    method: 'POST',
  },
}: UseSaveProjectProps) {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  const saveProject = ({ id, data }: SaveProjectProps) => {
    return PROJECTS.request({
      url: id ? `/${id}` : '/',
      data,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      ...requestConfig,
    });
  };

  return useMutation(saveProject, {
    onSuccess: (data: any, variables, context) => {
      const { id } = data;
      queryClient.invalidateQueries('projects');
      queryClient.invalidateQueries(['project', id]);
      console.info('Succces', data, variables, context);
    },
    onError: (error, variables, context) => {
      // An error happened!
      console.info('Error', error, variables, context);
    },
  });
}

export function useDeleteProject({
  requestConfig = {
    method: 'DELETE',
  },
}: UseDeleteProjectProps) {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  const deleteProject = ({ id }: DeleteProjectProps) => {
    return PROJECTS.request({
      method: 'DELETE',
      url: `/${id}`,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      ...requestConfig,
    });
  };

  return useMutation(deleteProject, {
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries('projects');
      console.info('Succces', data, variables, context);
    },
    onError: (error, variables, context) => {
      // An error happened!
      console.info('Error', error, variables, context);
    },
  });
}

export function useImportProject({
  requestConfig = {
    method: 'POST',
  },
}: UseImportProjectProps) {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  const uploadProject = ({ data }: ImportProjectProps) => {
    return UPLOADS.request({
      url: '/projects/import',
      data,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        'Content-Type': 'multipart/form-data',
      },
      ...requestConfig,
    });
  };

  return useMutation(uploadProject, {
    onSuccess: (data: any, variables, context) => {
      queryClient.invalidateQueries('projects');
      console.info('Succces', data, variables, context);
    },
    onError: (error, variables, context) => {
      console.info('Error', error, variables, context);
    },
  });
}

export function useUploadProjectPA({
  requestConfig = {
    method: 'POST',
  },
}: UseUploadProjectPAProps) {
  const { data: session } = useSession();

  const uploadProjectPAShapefile = ({ data }: UploadProjectPAProps) => {
    return UPLOADS.request({
      url: '/projects/planning-area/shapefile',
      data,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        'Content-Type': 'multipart/form-data',
      },
      ...requestConfig,
    });
  };

  return useMutation(uploadProjectPAShapefile, {
    onSuccess: (data: any, variables, context) => {
      console.info('Succces', data, variables, context);
    },
    onError: (error, variables, context) => {
      console.info('Error', error, variables, context);
    },
  });
}

export function useUploadProjectPAGrid({
  requestConfig = {
    method: 'POST',
  },
}: UseUploadProjectPAGridProps) {
  const { data: session } = useSession();

  const uploadProjectPAShapefileGrid = ({ data }: UploadProjectPAGridProps) => {
    return UPLOADS.request({
      url: '/projects/planning-area/shapefile-grid',
      data,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        'Content-Type': 'multipart/form-data',
      },
      ...requestConfig,
    });
  };

  return useMutation(uploadProjectPAShapefileGrid, {
    onSuccess: (data: any, variables, context) => {
      console.info('Succces', data, variables, context);
    },
    onError: (error, variables, context) => {
      console.info('Error', error, variables, context);
    },
  });
}

export function useDuplicateProject({
  requestConfig = {
    method: 'POST',
  },
}: UseDuplicateProjectProps) {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  const duplicateProject = ({ id, data }: DuplicateProjectProps) => {
    return PROJECTS.request({
      url: `/${id}/clone`,
      data,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      ...requestConfig,
    });
  };

  return useMutation(duplicateProject, {
    onSuccess: (data: any, variables, context) => {
      const { id } = data;
      queryClient.invalidateQueries('projects');
      queryClient.invalidateQueries(['projects', id]);
      console.info('Succces', data, variables, context);
    },
    onError: (error, variables, context) => {
      // An error happened!
      console.info('Error', error, variables, context);
    },
  });
}

export function usePublishProject({
  requestConfig = {
    method: 'POST',
  },
}: UsePublishProjectProps) {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  const publishProject = ({ pid, data }: PublishProjectProps) => {
    const baseUrl = process.env.NEXT_PUBLIC_URL || window.location.origin;

    return axios.request({
      method: 'POST',
      url: `${baseUrl}/api/publish/${pid}`,
      data,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      ...requestConfig,
    });
  };

  return useMutation(publishProject, {
    onSuccess: (data, variables) => {
      const { pid } = variables;
      queryClient.invalidateQueries('projects');
      queryClient.invalidateQueries(['project', pid]);
      queryClient.invalidateQueries('published-projects');
      queryClient.invalidateQueries('admin-published-projects');
    },
    onError: (error, variables, context) => {
      console.info('Error', error, variables, context);
    },
  });
}

export function useUnPublishProject({
  requestConfig = {
    method: 'POST',
  },
}: UseUnPublishProjectProps) {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  const unpublishProject = ({ id }: UnPublishProjectProps) => {
    return PROJECTS.request({
      url: `${id}/unpublish`,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      ...requestConfig,
    });
  };

  return useMutation(unpublishProject, {
    onSuccess: () => {
      queryClient.invalidateQueries('projects');
      queryClient.invalidateQueries('published-projects');
      queryClient.invalidateQueries('admin-published-projects');
    },
    onError: (error, variables, context) => {
      console.info('Error', error, variables, context);
    },
  });
}

/**
****************************************
  DOWNLOAD PROJECT
****************************************
*/
export function useExports(pid) {
  const { data: session } = useSession();

  const query = useQuery(
    ['projects-exports', pid],
    async () =>
      PROJECTS.request({
        method: 'GET',
        url: `/${pid}/latest-exports`,
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
        transformResponse: (data) => JSON.parse(data),
      }).then((response) => {
        return response.data;
      }),
    {
      enabled: !!pid,
    }
  );

  const { data } = query;

  return useMemo(() => {
    return {
      ...query,
      data: data?.exports || [],
    };
  }, [query, data]);
}

export function useExport(id) {
  const { data: session } = useSession();

  const query = useQuery(
    ['projects-export-id', id],
    async () =>
      PROJECTS.request({
        method: 'GET',
        url: `/${id}/export`,
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
        transformResponse: (data) => JSON.parse(data),
      }).then((response) => {
        return response.data;
      }),
    {
      enabled: !!id,
    }
  );

  const { data } = query;

  return useMemo(() => {
    return {
      ...query,
      data: data?.id,
    };
  }, [query, data?.id]);
}

export function useExportProject({
  requestConfig = {
    method: 'POST',
  },
}: UseExportProjectProps) {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  const projectDownload = ({ id, data }: ExportProjectProps) => {
    return PROJECTS.request({
      url: `${id}/export`,
      data,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      ...requestConfig,
    });
  };

  return useMutation(projectDownload, {
    onSuccess: (data: any, variables, context) => {
      console.info('Succces', data, variables, context);
      const { id } = variables;
      queryClient.invalidateQueries(['projects-export', id]);
    },
    onError: (error, variables, context) => {
      console.info('Error', error, variables, context);
    },
  });
}

export function useDownloadExport({
  requestConfig = {
    method: 'GET',
  },
}: UseDownloadExportProps) {
  const { data: session } = useSession();

  const downloadProject = ({ pid, exportId }: DownloadExportProps) => {
    return PROJECTS.request<ArrayBuffer>({
      url: `/${pid}/export/${exportId}`,
      responseType: 'arraybuffer',
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        'Content-Type': 'application/zip',
      },
      ...requestConfig,
    });
  };

  return useMutation(downloadProject, {
    onSuccess: (data, variables) => {
      const { data: blob } = data;
      const { pid } = variables;

      createDownloadLink(blob, `project-${pid}.zip`);
    },
    onError: (error, variables, context) => {
      console.info('Error', error, variables, context);
    },
  });
}

/**
****************************************
  LEGACY PROJECTS
****************************************
*/
export function useSaveLegacyProject({
  requestConfig = {
    method: 'POST',
  },
}: UseSaveLegacyProjectProps) {
  const { data: session } = useSession();

  const saveLegacyProject = ({ data }: SaveLegacyProjectProps) => {
    return PROJECTS.request({
      url: '/import/legacy',
      data,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      transformResponse: (response) => JSON.parse(response),
      ...requestConfig,
    });
  };

  return useMutation(saveLegacyProject, {
    onSuccess: (data: any, variables, context) => {
      console.info('Succces', data, variables, context);
    },
    onError: (error, variables, context) => {
      console.info('Error', error, variables, context);
    },
  });
}

export function useCancelImportLegacyProject({
  requestConfig = {
    method: 'POST',
  },
}: UseCancelImportLegacyProjectProps) {
  const { data: session } = useSession();

  const cancelImportLegacyProject = ({ projectId }: CancelImportLegacyProjectProps) => {
    return PROJECTS.request({
      method: 'POST',
      url: `/import/legacy/${projectId}/cancel`,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      transformResponse: (response) => JSON.parse(response),
      ...requestConfig,
    });
  };

  return useMutation(cancelImportLegacyProject, {
    onSuccess: (data, variables, context) => {
      console.info('Succces', data, variables, context);
    },
    onError: (error, variables, context) => {
      console.info('Error', error, variables, context);
    },
  });
}

export function useUploadLegacyProjectFile({
  requestConfig = {
    method: 'POST',
  },
}: UseUploadLegacyProjectFileProps) {
  const { data: session } = useSession();

  const uploadLegacyProjectFile = ({ data, projectId }: UploadLegacyProjectFileProps) => {
    return UPLOADS.request({
      url: `projects/import/legacy/${projectId}/data-file`,
      data,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        'Content-Type': 'multipart/form-data',
      },
      ...requestConfig,
    });
  };

  return useMutation(uploadLegacyProjectFile, {
    onSuccess: (data: any, variables, context) => {
      console.info('Succces', data, variables, context);
    },
    onError: (error, variables, context) => {
      console.info('Error', error, variables, context);
    },
  });
}

export function useCancelUploadLegacyProjectFile({
  requestConfig = {
    method: 'DELETE',
  },
}: UseCancelUploadLegacyProjectFileProps) {
  const { data: session } = useSession();

  const cancelUploadLegacyProjectFile = ({
    dataFileId,
    projectId,
  }: CancelUploadLegacyProjectFileProps) => {
    return PROJECTS.request({
      method: 'DELETE',
      url: `/import/legacy/${projectId}/data-file/${dataFileId}`,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      transformResponse: (response) => JSON.parse(response),
      ...requestConfig,
    });
  };

  return useMutation(cancelUploadLegacyProjectFile, {
    onSuccess: (data, variables, context) => {
      console.info('Succces', data, variables, context);
    },
    onError: (error, variables, context) => {
      console.info('Error', error, variables, context);
    },
  });
}

export function useLegacyProjectValidationResults({
  requestConfig = {
    method: 'GET',
  },
}: UseLegacyProjectValidationResultsProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const getLegacyProjectValidationResults = ({
    projectId,
  }: LegacyProjectValidationResultsProps) => {
    return PROJECTS.request({
      url: `/import/legacy/${projectId}/validation-results`,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        'Content-Type': 'multipart/form-data',
      },
      transformResponse: (response) => JSON.parse(response),
      ...requestConfig,
    }).then((response) => response.data);
  };

  return useMutation(getLegacyProjectValidationResults, {
    onSuccess: (data: any, variables, context) => {
      queryClient.invalidateQueries('projects');
      console.info('Succces', data, variables, context);
    },
    onError: (error, variables, context) => {
      console.info('Error', error, variables, context);
    },
  });
}

export function useImportLegacyProject({
  requestConfig = {
    method: 'POST',
  },
}: UseImportLegacyProjectProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const importLegacyProject = ({ projectId, data }: ImportLegacyProjectProps) => {
    return PROJECTS.request({
      method: 'POST',
      data,
      url: `/import/legacy/${projectId}`,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      transformResponse: (response) => JSON.parse(response),
      ...requestConfig,
    });
  };

  return useMutation(importLegacyProject, {
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries('projects');
      console.info('Succces', data, variables, context);
    },
    onError: (error, variables, context) => {
      console.info('Error', error, variables, context);
    },
  });
}
