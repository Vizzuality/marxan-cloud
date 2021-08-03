import { useMemo } from 'react';

import {
  useInfiniteQuery, useQuery,
} from 'react-query';

import flatten from 'lodash/flatten';
import { useSession } from 'next-auth/client';

import SCENARIOS from 'services/scenarios';

import {
  UseSolutionsOptionsProps,
} from './types';

export function useSolutions(scenarioId, options: UseSolutionsOptionsProps = {}) {
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

  const fetchFeatures = ({ pageParam = 1 }) => SCENARIOS.request({
    method: 'GET',
    url: `/${scenarioId}/marxan/solutions`,
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

  const query = useInfiniteQuery(['solutions', scenarioId, JSON.stringify(options)], fetchFeatures, {
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
          run: runId,
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

export function useSolution(scenarioId, solutionId) {
  const [session] = useSession();

  const query = useQuery(['scenarios', scenarioId, solutionId], async () => SCENARIOS.request({
    method: 'GET',
    url: `/${scenarioId}/marxan/solutions/${solutionId}`,
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  }));

  const { data } = query;

  return useMemo(() => {
    return {
      ...query,
      data: data?.data.data,
    };
  }, [query, data?.data.data]);
}

export function useMostDifferentSolutions(scenarioId, options: UseSolutionsOptionsProps = {}) {
  const [session] = useSession();

  const {
    filters = {},
  } = options;

  const parsedFilters = Object.keys(filters)
    .reduce((acc, k) => {
      return {
        ...acc,
        [`filter[${k}]`]: filters[k],
      };
    }, {});

  const query = useQuery(['scenarios', scenarioId], async () => SCENARIOS.request({
    method: 'GET',
    url: `/${scenarioId}/marxan/solutions/most-different`,
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
    params: {
      ...parsedFilters,
    },
  }));

  const { data } = query;

  return useMemo(() => {
    const parsedData = Array.isArray(data.data.data) ? data.data.data.map((d) => {
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
        run: runId,
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

export function useBestSolution(scenarioId) {
  const [session] = useSession();

  const query = useQuery(['scenarios', scenarioId], async () => SCENARIOS.request({
    method: 'GET',
    url: `/${scenarioId}/marxan/solutions/best`,
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  }));

  // const { data } = query;

  return useMemo(() => {
    const mockBestSolution = {
      id: 'c5a7ac37-3a88-4a08-9f23-bb83f0e8af11',
      runId: 9,
      scoreValue: 999,
      costValue: 900,
      missingValues: 19,
      planningUnits: 19,
    };

    return {
      ...query,
      data: mockBestSolution,
    };
  }, [query]);
}
