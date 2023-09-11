import { useMemo, useRef } from 'react';

import { useInfiniteQuery, useQuery } from 'react-query';

import { format } from 'd3';
import { sortBy } from 'lodash';
import flatten from 'lodash/flatten';
import { useSession } from 'next-auth/react';

import { ItemProps as RawItemProps } from 'components/gap-analysis/item/component';
import { Scenario } from 'types/api/scenario';

import SCENARIOS from 'services/scenarios';

import { UseFeaturesOptionsProps } from './types';

type AllItemProps = RawItemProps;

export function useAllGapAnalysis(sId: Scenario['id'], queryOptions) {
  const { data: session } = useSession();

  return useQuery(
    'all-gap-analysis',
    async () =>
      SCENARIOS.request({
        method: 'GET',
        url: `/${sId}/features/gap-data`,
        params: {
          disablePagination: true,
          fields: 'featureId',
        },
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      }).then((response) => {
        return response.data?.data;
      }),
    {
      ...queryOptions,
    }
  );
}

export function usePreGapAnalysis(sId, options: UseFeaturesOptionsProps = {}) {
  const placeholderDataRef = useRef({
    pages: [],
    pageParams: [],
  });
  const { data: session } = useSession();

  const { filters = {}, search, sort } = options;

  const parsedFilters = Object.keys(filters).reduce((acc, k) => {
    return {
      ...acc,
      [`filter[${k}]`]: filters[k],
    };
  }, {});

  const fetchFeatures = ({ pageParam = 1 }) =>
    SCENARIOS.request({
      method: 'GET',
      url: `/${sId}/features/gap-data`,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      params: {
        'page[number]': pageParam,
        ...parsedFilters,
        ...(search && {
          q: search,
        }),
        ...(sort && {
          sort,
        }),
      },
    });

  const query = useInfiniteQuery(
    ['pre-gap-analysis', sId, JSON.stringify(options)],
    fetchFeatures,
    {
      placeholderData: placeholderDataRef.current,
      getNextPageParam: (lastPage) => {
        const {
          data: { meta },
        } = lastPage;
        const { page, totalPages } = meta;

        const nextPage = page + 1 > totalPages ? null : page + 1;
        return nextPage;
      },
    }
  );

  const { data } = query;
  const { pages } = data || {};

  if (data) {
    placeholderDataRef.current = data;
  }

  return useMemo(() => {
    const parsedData = Array.isArray(pages)
      ? flatten(
          pages.map((p) => {
            const {
              data: { data: pageData },
            } = p;

            return sortBy(
              pageData.map((d): AllItemProps => {
                const {
                  id,
                  name,
                  featureClassName,
                  met,
                  metArea,
                  coverageTarget,
                  coverageTargetArea,
                  onTarget,
                } = d;

                return {
                  id,
                  name: name || featureClassName || 'Metadata name',
                  onTarget,
                  current: {
                    percent: met / 100,
                    value: format('.3s')(metArea / 1000000),
                    unit: 'km2',
                  },
                  target: {
                    percent: coverageTarget / 100,
                    value: format('.3s')(coverageTargetArea / 1000000),
                    unit: 'km2',
                  },
                };
              }),
              ['name']
            );
          })
        )
      : [];

    return {
      ...query,
      data: parsedData,
    };
  }, [query, pages]);
}

export function usePostGapAnalysis(sId, options: UseFeaturesOptionsProps = {}) {
  const placeholderDataRef = useRef({
    pages: [],
    pageParams: [],
  });
  const { data: session } = useSession();

  const { filters = {}, search, sort } = options;

  const parsedFilters = Object.keys(filters).reduce((acc, k) => {
    return {
      ...acc,
      [`filter[${k}]`]: filters[k],
    };
  }, {});

  const fetchFeatures = ({ pageParam = 1 }) =>
    SCENARIOS.request({
      method: 'GET',
      url: `/${sId}/marxan/solutions/gap-data`,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      params: {
        'page[number]': pageParam,
        ...parsedFilters,
        ...(search && {
          q: search,
        }),
        ...(sort && {
          sort,
        }),
      },
    });

  const query = useInfiniteQuery(
    ['post-gap-analysis', sId, JSON.stringify(options)],
    fetchFeatures,
    {
      enabled: !!filters.runId,
      placeholderData: placeholderDataRef.current,
      getNextPageParam: (lastPage) => {
        const {
          data: { meta },
        } = lastPage;
        const { page, totalPages } = meta;

        const nextPage = page + 1 > totalPages ? null : page + 1;
        return nextPage;
      },
    }
  );

  const { data } = query;
  const { pages } = data || {};

  if (data) {
    placeholderDataRef.current = data;
  }

  return useMemo(() => {
    const parsedData = Array.isArray(pages)
      ? flatten(
          pages.map((p) => {
            const {
              data: { data: pageData },
            } = p;

            return pageData.map((d): AllItemProps => {
              const {
                id,
                name,
                met,
                featureClassName,
                metArea,
                coverageTarget,
                coverageTargetArea,
                onTarget,
              } = d;

              return {
                id,
                name: name || featureClassName || 'Metadata name',
                onTarget,
                current: {
                  percent: met / 100,
                  value: format('.3s')(metArea / 1000000),
                  unit: 'km2',
                },
                target: {
                  percent: coverageTarget / 100,
                  value: format('.3s')(coverageTargetArea / 1000000),
                  unit: 'km2',
                },
              };
            });
          })
        )
      : [];

    return {
      ...query,
      data: parsedData,
    };
  }, [query, pages]);
}
