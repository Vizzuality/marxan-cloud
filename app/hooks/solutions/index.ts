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

  const fetchFeatures = ({ pageParam = 1 }) => SCENARIOS.request({
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

  const query = useInfiniteQuery(['solutions', sid, JSON.stringify(options)], fetchFeatures, {
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

export function useBestSolution(sid) {
  const [session] = useSession();

  const query = useQuery(['solutions-best', sid], async () => SCENARIOS.request({
    method: 'GET',
    url: `/${sid}/marxan/solutions/best`,
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  }).then((response) => {
    return response.data;
  }));

  const { data } = query;

  return useMemo(() => {
    return {
      ...query,
      data: data?.data,
    };
  }, [query, data]);
}
