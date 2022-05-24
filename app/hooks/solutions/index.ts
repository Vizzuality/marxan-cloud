import { useMemo } from 'react';

import {
  useInfiniteQuery, useMutation, useQuery,
} from 'react-query';

import flatten from 'lodash/flatten';

import { useSession } from 'next-auth/client';

import DOWNLOADS from 'services/downloads';
import SCENARIOS from 'services/scenarios';

import {
  DownloadScenarioSolutionsProps,
  UseDownloadScenarioSolutionsProps,
  UseSolutionsOptionsProps,
} from './types';

export function useSolutions(sid, options: UseSolutionsOptionsProps = {}) {
  const [session] = useSession();

  const {
    filters = {},
    sort,
  } = options;

  const parsedFilters = Object.keys(filters)
    .reduce((acc, k) => {
      return {
        ...acc,
        [`filter[${k}]`]: filters[k],
      };
    }, {});

  const fetchSolutions = ({ pageParam = 1 }) => SCENARIOS.request({
    method: 'GET',
    url: `/${sid}/marxan/solutions`,
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
    params: {
      'page[number]': pageParam,
      ...parsedFilters,
      ...sort && {
        sort,
      },
    },
  });

  const query = useInfiniteQuery(['solutions', sid, JSON.stringify(options)], fetchSolutions, {
    keepPreviousData: true,
    getNextPageParam: (lastPage) => {
      const { data: { meta } } = lastPage;
      const { page, totalPages } = meta;

      const nextPage = page + 1 > totalPages ? null : page + 1;
      return nextPage;
    },
  });

  const { data } = query;
  const { pages } = data || {};

  return useMemo(() => {
    const parsedData = Array.isArray(pages) ? flatten(pages.map((p) => {
      const { data: { data: pageData } } = p;

      return pageData.map((d) => {
        const {
          id,
          runId,
          scoreValue,
          costValue,
          planningUnits,
          missingValues,
        } = d;

        return {
          id,
          runId,
          score: scoreValue,
          cost: costValue,
          planningUnits,
          missingValues,
        };
      });
    })) : [];

    return {
      ...query,
      data: parsedData,
    };
  }, [query, pages]);
}

export function useAllSolutions(sid, options: UseSolutionsOptionsProps = {}) {
  const [session] = useSession();

  const {
    filters = {},
    sort,
  } = options;

  const parsedFilters = Object.keys(filters)
    .reduce((acc, k) => {
      return {
        ...acc,
        [`filter[${k}]`]: filters[k],
      };
    }, {});

  const fetchSolutions = () => SCENARIOS.request({
    method: 'GET',
    url: `/${sid}/marxan/solutions`,
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
    params: {
      disablePagination: true,
      ...parsedFilters,
      ...sort && {
        sort,
      },
    },
  }).then((response) => response.data);

  const query = useQuery(['all-solutions', sid, JSON.stringify(options)], fetchSolutions, {
    keepPreviousData: true,
  });

  const { data } = query;

  return useMemo(() => {
    return {
      ...query,
      data: data?.data,
    };
  }, [query, data]);
}

export function useSolution(sid, solutionId) {
  const [session] = useSession();

  const query = useQuery(['solution-id', sid, solutionId], async () => SCENARIOS.request({
    method: 'GET',
    url: `/${sid}/marxan/solutions/${solutionId}`,
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  }).then((response) => {
    return response.data;
  }), {
    keepPreviousData: true,
    enabled: !!solutionId,
  });

  const { data } = query;

  return useMemo(() => {
    return {
      ...query,
      data: data?.data,
    };
  }, [query, data?.data]);
}

export function useMostDifferentSolutions(sid) {
  const [session] = useSession();

  const query = useQuery(['solutions-different', sid], async () => SCENARIOS.request({
    method: 'GET',
    url: `/${sid}/marxan/solutions/most-different`,
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  }).then((response) => {
    return response.data;
  }));

  const { data } = query;

  return useMemo(() => {
    const parsedData = Array.isArray(data?.data) ? data.data.map((d) => {
      const {
        id,
        runId,
        scoreValue,
        costValue,
        planningUnits,
        missingValues,
      } = d;

      return {
        id,
        runId,
        score: scoreValue,
        cost: costValue,
        planningUnits,
        missingValues,
      };
    }) : [];

    return {
      ...query,
      data: parsedData,
    };
  }, [query, data]);
}

export function useBestSolution(sid, queryOptions) {
  const [session] = useSession();

  const query = useQuery(['solutions-best', sid], async () => SCENARIOS.request({
    method: 'GET',
    url: `/${sid}/marxan/solutions/best`,
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  }).then((response) => {
    return response.data;
  }), {
    keepPreviousData: true,
    ...queryOptions,
  });

  const { data } = query;

  return useMemo(() => {
    return {
      ...query,
      data: data?.data || {},
    };
  }, [query, data]);
}

export function useDownloadSolutions({
  requestConfig = {
    method: 'GET',
  },
}: UseDownloadScenarioSolutionsProps) {
  const [session] = useSession();

  const downloadScenarioSolutions = ({ id }: DownloadScenarioSolutionsProps) => {
    return DOWNLOADS.request({
      url: `/scenarios/${id}/marxan/output`,
      responseType: 'arraybuffer',
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        'Content-Type': 'application/zip',
      },
      ...requestConfig,
    });
  };

  return useMutation(downloadScenarioSolutions, {
    onSuccess: (data: any, variables, context) => {
      const { data: blob } = data;
      const { id } = variables;

      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `solutions-${id}.zip`);
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
