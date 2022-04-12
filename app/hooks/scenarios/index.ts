import { useMemo } from 'react';

import {
  useQuery, useInfiniteQuery, useMutation, useQueryClient, useQueries,
} from 'react-query';

import flatten from 'lodash/flatten';

import { useRouter } from 'next/router';

import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { useSession } from 'next-auth/client';

import { useMe } from 'hooks/me';
import { useProjectUsers } from 'hooks/project-users';

import { ItemProps } from 'components/scenarios/item/component';

import DOWNLOADS from 'services/downloads';
import PROJECTS from 'services/projects';
import SCENARIOS from 'services/scenarios';
import UPLOADS from 'services/uploads';

import {
  UseScenariosOptionsProps,
  UseSaveScenarioProps,
  SaveScenarioProps,
  UseDeleteScenarioProps,
  DeleteScenarioProps,
  UseDownloadScenarioCostSurfaceProps,
  DownloadScenarioCostSurfaceProps,
  UseUploadScenarioCostSurfaceProps,
  UploadScenarioCostSurfaceProps,
  UseUploadScenarioPUProps,
  UploadScenarioPUProps,
  UseSaveScenarioPUProps,
  SaveScenarioPUProps,
  UploadPAProps,
  UseUploadPAProps,
  UseDuplicateScenarioProps,
  DuplicateScenarioProps,
  UseRunScenarioProps,
  RunScenarioProps,
  UseCancelRunScenarioProps,
  CancelRunScenarioProps,
  UseSaveScenarioCalibrationRangeProps,
  SaveScenarioCalibrationRangeProps,
  UseSaveScenarioLockProps,
  SaveScenarioLockProps,
  UseDeleteScenarioLockProps,
  DeleteScenarioLockProps,
  UseDownloadScenarioReportProps,
  DownloadScenarioReportProps,
  UseBlmImageProps,
} from './types';

function fetchScenarioBLMImage(sId, blmValue, session) {
  return SCENARIOS.request({
    method: 'GET',
    url: `/${sId}/calibration/maps/preview/${blmValue}`,
    responseType: 'arraybuffer',
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },

  }).then((response) => {
    const data = {
      blmValue,
      image: response.data,
    };
    return data;
  });
}

/**
****************************************
  SCENARIO STATUS
****************************************
*/
export function useScenariosStatus(pId) {
  const [session] = useSession();

  const query = useQuery(['scenarios-status', pId], async () => PROJECTS.request({
    method: 'GET',
    url: `/${pId}/scenarios/status`,
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  }).then((response) => {
    return response.data;
  }), {
    enabled: !!pId,
    placeholderData: {
      data: {
        jobs: [],
        scenarios: [],
      },
    },
    refetchInterval: 2500,
  });

  const { data } = query;

  return useMemo(() => {
    return {
      ...query,
      data: data?.data,
    };
  }, [query, data?.data]);
}

export function useScenarioStatus(pId, sId) {
  const [session] = useSession();

  const query = useQuery(['scenarios-status', pId, sId], async () => PROJECTS.request({
    method: 'GET',
    url: `/${pId}/scenarios/status`,
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  }).then((response) => {
    return response.data;
  }), {
    enabled: !!sId,
    placeholderData: {
      data: {
        scenarios: [],
      },
    },
    refetchInterval: 1000,
  });

  const { data } = query;

  return useMemo(() => {
    const scenarios = data?.data?.scenarios || [];
    const CURRENT = scenarios.find((s) => s.id === sId);

    return {
      ...query,
      data: CURRENT || {},
    };
  }, [query, data?.data, sId]);
}

/**
****************************************
  SCENARIO LOCKS
****************************************
*/

export function useProjectScenariosLocks(pid) {
  const [session] = useSession();

  const query = useQuery(['project-locks', pid], async () => PROJECTS.request({
    method: 'GET',
    url: `/${pid}/editing-locks`,
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
    transformResponse: (data) => JSON.parse(data),
  }).then((response) => {
    return response.data;
  }), {
    enabled: !!pid,
    refetchInterval: 2500,
  });

  const { data } = query;

  return useMemo(() => {
    return {
      ...query,
      data: data?.data,
    };
  }, [query, data?.data]);
}
export function useScenarioLock(sid) {
  const [session] = useSession();

  const query = useQuery(['scenario-lock', sid], async () => SCENARIOS.request({
    method: 'GET',
    url: `/${sid}/editing-locks`,
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
    transformResponse: (data) => JSON.parse(data),
  }).then((response) => {
    return response.data;
  }), {
    enabled: !!sid,
  });

  const { data } = query;

  return useMemo(() => {
    return {
      ...query,
      data: data?.data,
    };
  }, [query, data?.data]);
}

export function useScenarioLockMe(sid) {
  const {
    data: scenarioLockData,
  } = useScenarioLock(sid);
  const { user } = useMe();

  return useMemo(() => {
    return (user.id === scenarioLockData?.userId);
  }, [user, scenarioLockData]);
}

export function useSaveScenarioLock({
  requestConfig = {
    method: 'POST',
  },
}: UseSaveScenarioLockProps) {
  const queryClient = useQueryClient();
  const [session] = useSession();

  const saveScenarioLock = ({ sid }: SaveScenarioLockProps) => {
    return SCENARIOS.request({
      url: `/${sid}/lock`,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      ...requestConfig,
      transformResponse: (data) => JSON.parse(data),
    });
  };

  return useMutation(saveScenarioLock, {
    onSuccess: (data: any, variables) => {
      const { sid } = variables;
      queryClient.invalidateQueries('project-locks');
      queryClient.invalidateQueries(['scenario-lock', sid]);
    },
    onError: (error, variables, context) => {
      // An error happened!
      console.info('Error', error, variables, context);
    },
  });
}

export function useDeleteScenarioLock({
  requestConfig = {
    method: 'DELETE',
  },
}: UseDeleteScenarioLockProps) {
  const queryClient = useQueryClient();
  const [session] = useSession();

  const deleteScenarioLock = ({ sid }: DeleteScenarioLockProps) => {
    return SCENARIOS.request({
      url: `/${sid}/lock`,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      ...requestConfig,
    });
  };

  return useMutation(deleteScenarioLock, {
    onSuccess: (data: any, variables) => {
      const { sid } = variables;
      queryClient.invalidateQueries('project-locks');
      queryClient.invalidateQueries(['scenario-lock', sid]);
    },
    onError: (error, variables, context) => {
      // An error happened!
      console.info('Error', error, variables, context);
    },
  });
}

/**
****************************************
  SCENARIOS
****************************************
*/
export function useScenarios(pId, options: UseScenariosOptionsProps = {}) {
  const [session] = useSession();
  const { push } = useRouter();

  const {
    filters = {},
    search,
    sort,
  } = options;

  const parsedFilters = Object.keys(filters)
    .reduce((acc, k) => {
      // Backend isn't able to deal with this one yet; it'll always return an empty array
      // if we set it. We'll do it manually in the frontend. Not ideal, but allows us to
      // move forward with useable filters.
      if (k === 'status') return acc;

      return {
        ...acc,
        [`filter[${k}]`]: (filters[k] && filters[k].toString) ? filters[k].toString() : filters[k],
      };
    }, {});

  const fetchScenarios = ({ pageParam = 1 }) => SCENARIOS.request({
    method: 'GET',
    url: '/',
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
    params: {
      'page[number]': pageParam,
      ...parsedFilters,
      ...search && {
        q: search,
      },
      ...sort && {
        sort,
      },
    },
  });

  const query = useInfiniteQuery(['scenarios', pId, JSON.stringify(options)], fetchScenarios, {
    retry: false,
    keepPreviousData: true,
    getNextPageParam: (lastPage) => {
      const { data: { meta } } = lastPage;
      const { page, totalPages } = meta;

      const nextPage = page + 1 > totalPages ? null : page + 1;
      return nextPage;
    },
  });

  const { user } = useMe();

  const { data: statusData = { scenarios: [] } } = useScenariosStatus(pId);
  const { scenarios: statusScenarios = [] } = statusData;

  const { data: scenariosLocksData = [] } = useProjectScenariosLocks(pId);
  const { data: projectUsersData = [] } = useProjectUsers(pId);

  const { data } = query;
  const { pages } = data || {};

  return useMemo(() => {
    const parsedData = Array.isArray(pages) ? flatten(pages.map((p) => {
      const { data: { data: pageData } } = p;

      return pageData.map((d): ItemProps => {
        const {
          id, projectId, name, lastModifiedAt, status,
        } = d;

        const jobs = statusScenarios.find((s) => s.id === id)?.jobs || [];
        const runStatus = status || jobs.find((job) => job.kind === 'run')?.status || 'created';

        let lock = scenariosLocksData.find((sl) => sl.scenarioId === id && sl.userId !== user?.id);
        if (lock) {
          const userLock = projectUsersData.find((pu) => pu?.user?.id === lock.userId);

          lock = {
            ...lock,
            ...userLock?.user,
            roleName: userLock?.roleName,
          };
        }

        const lastUpdateDistance = () => {
          return formatDistanceToNow(
            new Date(lastModifiedAt),
            { addSuffix: true },
          );
        };

        return {
          id,
          name,
          lastUpdate: lastModifiedAt,
          lastUpdateDistance: lastUpdateDistance(),
          warnings: false,
          runStatus,
          jobs,
          lock,
          onEdit: () => {
            push(`/projects/${projectId}/scenarios/${id}/edit`);
          },
        };
      });
    })) : [];

    // Backend can't deal with the `status` filter just yet, so we'll just manually
    // filter it out manually in the frontend. It'll allow us to make the feature work
    // in the frontend for now, albeit in a non-ideal way.
    const filteredData = parsedData.filter((parsedDataItem) => {
      const statusFiltersArr = (filters?.status as Array<string> || []);
      // No filters to apply, return everything
      if (!statusFiltersArr.length) return true;
      return statusFiltersArr.includes(parsedDataItem.runStatus);
    });

    return {
      ...query,
      data: filteredData,
    };
  }, [
    query, pages, filters, push, user?.id, statusScenarios, scenariosLocksData, projectUsersData,
  ]);
}

export function useScenario(id) {
  const [session] = useSession();

  const query = useQuery(['scenarios', id], async () => SCENARIOS.request({
    method: 'GET',
    url: `/${id}`,
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  }).then((response) => {
    return response.data;
  }), {
    enabled: !!id,
  });

  const { data } = query;

  return useMemo(() => {
    return {
      ...query,
      data: data?.data,
    };
  }, [query, data?.data]);
}

export function useSaveScenario({
  requestConfig = {
    method: 'POST',
  },
}: UseSaveScenarioProps) {
  const queryClient = useQueryClient();
  const [session] = useSession();

  const saveScenario = ({ id, data }: SaveScenarioProps) => {
    return SCENARIOS.request({
      url: id ? `/${id}` : '/',
      data,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      ...requestConfig,
    });
  };

  return useMutation(saveScenario, {
    onSuccess: (data: any, variables, context) => {
      const { id, projectId } = data?.data?.data;
      // const { isoDate, started } = data?.data?.meta;
      queryClient.invalidateQueries(['scenarios', projectId]);
      queryClient.setQueryData(['scenarios', id], data?.data);

      console.info('Success', data, variables, context);
    },
    onError: (error, variables, context) => {
      // An error happened!
      console.info('Error', error, variables, context);
    },
  });
}

export function useDeleteScenario({
  requestConfig = {
    method: 'DELETE',
  },
}: UseDeleteScenarioProps) {
  const [session] = useSession();

  const deleteScenario = ({ id }: DeleteScenarioProps) => {
    return SCENARIOS.request({
      method: 'DELETE',
      url: `/${id}`,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      ...requestConfig,
    });
  };

  return useMutation(deleteScenario, {
    onSuccess: (data, variables, context) => {
      console.info('Success', data, variables, context);
    },
    onError: (error, variables, context) => {
      // An error happened!
      console.info('Error', error, variables, context);
    },
  });
}

export function useUploadScenarioPU({
  requestConfig = {
    method: 'POST',
  },
}: UseUploadScenarioPUProps) {
  const [session] = useSession();

  const uploadScenarioPUShapefile = ({ id, data }: UploadScenarioPUProps) => {
    return UPLOADS.request({
      url: `/scenarios/${id}/planning-unit-shapefile`,
      data,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        'Content-Type': 'multipart/form-data',
      },
      ...requestConfig,
    });
  };

  return useMutation(uploadScenarioPUShapefile, {
    onSuccess: (data: any, variables, context) => {
      console.info('Success', data, variables, context);
    },
    onError: (error, variables, context) => {
      // An error happened!
      console.info('Error', error, variables, context);
    },
  });
}

// CUSTOM PROTECTED AREAS
export function useUploadPA({
  requestConfig = {
    method: 'POST',
  },
}: UseUploadPAProps) {
  const [session] = useSession();

  const uploadPAShapefile = ({ id, data }: UploadPAProps) => {
    return UPLOADS.request({
      url: `scenarios/${id}/protected-areas/shapefile`,
      data,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        'Content-Type': 'multipart/form-data',
      },
      ...requestConfig,
    });
  };

  return useMutation(uploadPAShapefile, {
    onSuccess: (data: any, variables, context) => {
      console.info('Success', data, variables, context);
    },
    onError: (error, variables, context) => {
      console.info('Error', error, variables, context);
    },
  });
}

export function useCostSurfaceRange(id) {
  const [session] = useSession();

  const query = useQuery(['scenarios-cost-surface', id], async () => SCENARIOS.request({
    method: 'GET',
    url: `/${id}/cost-surface`,
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
    transformResponse: (data) => {
      try {
        return JSON.parse(data);
      } catch (error) {
        return data;
      }
    },
  }).then((response) => {
    return response.data;
  }), {
    enabled: !!id,
  });

  const { data } = query;

  return useMemo(() => {
    return {
      ...query,
      data,
    };
  }, [query, data]);
}

export function useDownloadCostSurface({
  requestConfig = {
    method: 'GET',
  },
}: UseDownloadScenarioCostSurfaceProps) {
  const [session] = useSession();

  const downloadScenarioCostSurface = ({ id }: DownloadScenarioCostSurfaceProps) => {
    return DOWNLOADS.request({
      url: `/scenarios/${id}/cost-surface/shapefile-template`,
      responseType: 'arraybuffer',
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        'Content-Type': 'application/zip',
      },
      ...requestConfig,
    });
  };

  return useMutation(downloadScenarioCostSurface, {
    onSuccess: (data: any, variables, context) => {
      const { data: blob } = data;
      const { id } = variables;

      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `cost-surface-${id}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      console.info('Success', data, variables, context);
    },
    onError: (error, variables, context) => {
      // An error happened!
      console.info('Error', error, variables, context);
    },
  });
}

export function useUploadCostSurface({
  requestConfig = {
    method: 'GET',
  },
}: UseUploadScenarioCostSurfaceProps) {
  const [session] = useSession();

  const uploadScenarioCostSurface = ({ id, data }: UploadScenarioCostSurfaceProps) => {
    return UPLOADS.request({
      url: `/scenarios/${id}/cost-surface/shapefile`,
      data,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        'Content-Type': 'multipart/form-data',
      },
      ...requestConfig,
    });
  };

  return useMutation(uploadScenarioCostSurface, {
    onSuccess: (data: any, variables, context) => {
      console.info('Success', data, variables, context);
    },
    onError: (error, variables, context) => {
      // An error happened!
      console.info('Error', error, variables, context);
    },
  });
}

// PLANNING UNITS
export function useScenarioPU(sid) {
  const [session] = useSession();

  const query = useQuery(['scenarios-pu', sid], async () => SCENARIOS.request({
    method: 'GET',
    url: `/${sid}/planning-units`,
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
    transformResponse: (data) => {
      try {
        return JSON.parse(data);
      } catch (error) {
        return data;
      }
    },
  }).then((response) => {
    return response.data;
  }), {
    enabled: !!sid,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
    placeholderData: [],
  });

  const { data } = query;

  return useMemo(() => {
    const parsedData = data || [];
    const included = parsedData
      .filter((p) => p.inclusionStatus === 'locked-in')
      .map((p) => p.id);

    const includedDefault = parsedData
      .filter((p) => p.defaultStatus === 'locked-in')
      .map((p) => p.id);

    const excluded = parsedData
      .filter((p) => p.inclusionStatus === 'locked-out')
      .map((p) => p.id);

    const excludedDefault = parsedData
      .filter((p) => p.defaultStatus === 'locked-out')
      .map((p) => p.id);

    return {
      ...query,
      data: {
        included,
        excluded,
        includedDefault,
        excludedDefault,
      },
    };
  }, [query, data]);
}

export function useSaveScenarioPU({
  requestConfig = {
    method: 'POST',
  },
}: UseSaveScenarioPUProps) {
  const queryClient = useQueryClient();
  const [session] = useSession();

  const saveScenario = ({ id, data }: SaveScenarioPUProps) => {
    return SCENARIOS.request({
      url: `/${id}/planning-units`,
      data,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      ...requestConfig,
    });
  };

  return useMutation(saveScenario, {
    onSuccess: (data: any, variables, context) => {
      console.info('Success', data, variables, context);
      const { id } = variables;
      queryClient.invalidateQueries(['scenarios-pu', id]);
    },
    onError: (error, variables, context) => {
      console.info('Error', error, variables, context);
    },
  });
}

export function useDuplicateScenario({
  requestConfig = {
    method: 'POST',
  },
}: UseDuplicateScenarioProps) {
  const queryClient = useQueryClient();
  const [session] = useSession();

  const duplicateScenario = ({ id }: DuplicateScenarioProps) => {
    // Pending endpoint
    return SCENARIOS.request({
      url: `/${id}`,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      ...requestConfig,
    });
  };

  return useMutation(duplicateScenario, {
    onSuccess: (data: any, variables, context) => {
      const { id, projectId } = data;
      queryClient.invalidateQueries(['scenarios', projectId]);
      queryClient.invalidateQueries(['scenarios', id]);
      console.info('Success', data, variables, context);
    },
    onError: (error, variables, context) => {
      // An error happened!
      console.info('Error', error, variables, context);
    },
  });
}

export function useRunScenario({
  requestConfig = {
    method: 'POST',
  },
}: UseRunScenarioProps) {
  const [session] = useSession();

  const duplicateScenario = ({ id }: RunScenarioProps) => {
    // Pending endpoint
    return SCENARIOS.request({
      url: `/${id}/marxan`,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      ...requestConfig,
    });
  };

  return useMutation(duplicateScenario, {
    onSuccess: (data: any, variables, context) => {
      console.info('Success', data, variables, context);
    },
    onError: (error, variables, context) => {
      // An error happened!
      console.info('Error', error, variables, context);
    },
  });
}

export function useCancelRunScenario({
  requestConfig = {
    method: 'DELETE',
  },
}: UseCancelRunScenarioProps) {
  const [session] = useSession();

  const duplicateScenario = ({ id }: CancelRunScenarioProps) => {
    // Pending endpoint
    return SCENARIOS.request({
      url: `/${id}/marxan`,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      ...requestConfig,
    });
  };

  return useMutation(duplicateScenario, {
    onSuccess: (data: any, variables, context) => {
      console.info('Success', data, variables, context);
    },
    onError: (error, variables, context) => {
      // An error happened!
      console.info('Error', error, variables, context);
    },
  });
}

// BLM
export function useCalibrationBLMImages({ sid, blmValues }) {
  const [session] = useSession();

  const userQueries = useQueries(
    blmValues.map((blmValue) => {
      return {
        queryKey: ['scenario-blm-image', sid, blmValue],
        queryFn: () => fetchScenarioBLMImage(sid, blmValue, session),
      };
    }),
  );

  const CALIBRATION_IMAGES = useMemo(() => {
    if (userQueries.every((u) => u?.isFetched)) {
      return userQueries.reduce((acc, q: UseBlmImageProps) => {
        const { data } = q;

        if (data) {
          const { blmValue, image: blob } = data;
          const imageURL = window.URL.createObjectURL(new Blob([blob]));

          return {
            ...acc,
            [blmValue]: imageURL,
          };
        }

        return {
          ...acc,
        };
      }, {});
    }
    return {};
  }, [userQueries]);

  return useMemo(() => {
    return {
      data: CALIBRATION_IMAGES,
    };
  }, [CALIBRATION_IMAGES]);
}

export function useScenarioCalibrationResults(scenarioId) {
  const [session] = useSession();

  const query = useQuery(['scenario-calibration', scenarioId], async () => SCENARIOS.request({
    method: 'GET',
    url: `/${scenarioId}/calibration`,
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
    transformResponse: (data) => JSON.parse(data),
  }));

  const { data } = query;

  const blmValues = data?.data.map((i) => i.blmValue) || [];
  const { data: blmImages } = useCalibrationBLMImages({ sid: scenarioId, blmValues });

  return useMemo(() => {
    const parsedData = Array.isArray(data?.data)
      ? data?.data.sort((a, b) => (a.cost > b.cost ? 1 : -1)).map((i) => {
        return {
          ...i,
          pngData: blmImages[i.blmValue],
        };
      }) : [];

    return {
      ...query,
      data: parsedData,
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, data?.data]);
}

export function useScenarioCalibrationRange(scenarioId) {
  const [session] = useSession();

  const query = useQuery(['scenario-calibration-range', scenarioId], async () => SCENARIOS.request({
    method: 'GET',
    url: `/${scenarioId}/blm/range`,
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
    transformResponse: (data) => JSON.parse(data),
  }));

  const { data } = query;

  return useMemo(() => {
    return {
      ...query,
      data: data?.data?.range,
    };
  }, [query, data?.data]);
}

export function useSaveScenarioCalibrationRange({
  requestConfig = {
    method: 'POST',
  },
}: UseSaveScenarioCalibrationRangeProps) {
  const queryClient = useQueryClient();
  const [session] = useSession();

  const saveScenarioCalibrationRange = ({ sid, data }: SaveScenarioCalibrationRangeProps) => {
    const baseUrl = /* process.env.NEXT_PUBLIC_URL || */ window.location.origin;

    return axios.request({
      url: `${baseUrl}/api/reports/scenarios/${sid}/blm`,
      data,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      ...requestConfig,
    });
  };

  return useMutation(saveScenarioCalibrationRange, {
    onSuccess: (data: any, variables, context) => {
      console.info('Succcess', data, variables, context);
      const { sid: scenarioId } = variables;
      queryClient.invalidateQueries(['scenario-calibration', scenarioId]);
      queryClient.invalidateQueries(['scenario-calibration-range', scenarioId]);
    },
    onError: (error, variables, context) => {
      console.info('Error', error, variables, context);
    },
  });
}

export function useDownloadScenarioReport({
  requestConfig = {
    method: 'POST',
  },
}: UseDownloadScenarioReportProps) {
  const [session] = useSession();

  const downloadScenarioReport = ({ sid, solutionId }: DownloadScenarioReportProps) => {
    const baseUrl = process.env.NEXT_PUBLIC_URL || window.location.origin;

    return axios.request({
      url: `${baseUrl}/api/reports/scenarios/${sid}/solutions?solutionId=${solutionId}`,
      responseType: 'arraybuffer',
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      ...requestConfig,
    });
  };

  return useMutation(downloadScenarioReport, {
    onSuccess: (data: any, variables, context) => {
      const { data: blob } = data;
      const { sid } = variables;

      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `solutions-report-${sid}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      console.info('Succces', data, variables, context);
    },
    onError: (error, variables, context) => {
      // An error happened!
      console.info('Error', error, variables, context);
    },
  });
}
