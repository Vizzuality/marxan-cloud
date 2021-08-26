import { useMemo, useRef } from 'react';

import {
  useInfiniteQuery, useQuery,
} from 'react-query';

import flatten from 'lodash/flatten';

import { format } from 'd3';
import { useSession } from 'next-auth/client';

import { ItemProps as RawItemProps } from 'components/gap-analysis/item/component';

import SCENARIOS from 'services/scenarios';

import {
  UseFeaturesOptionsProps,
} from './types';

interface AllItemProps extends RawItemProps {}

export function useAllGapAnalysis(sId, queryOptions) {
  const [session] = useSession();

  const query = useQuery('all-gap-analysis', async () => SCENARIOS.request({
    method: 'GET',
    url: `/${sId}/features/gap-data`,
    params: {
      disablePagination: true,
      fields: 'featureId',
      omitFields: 'featureClassName,tag',
    },
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  }).then((response) => {
    return response.data;
  }), {
    placeholderData: {
      data: [],
    },
    ...queryOptions,
  });

  const { data } = query;

  return useMemo(() => {
    return {
      ...query,
      data: data?.data,
    };
  }, [query, data?.data]);
}

export function usePreGapAnalysis(sId, options: UseFeaturesOptionsProps = {}) {
  const placeholderDataRef = useRef({
    pages: [],
    pageParams: [],
  });
  const [session] = useSession();

  const {
    filters = {},
    search,
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
    url: `/${sId}/features/gap-data`,
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

  const query = useInfiniteQuery(['pre-gap-analysis', sId, JSON.stringify(options)], fetchFeatures, {
    placeholderData: placeholderDataRef.current,
    getNextPageParam: (lastPage) => {
      const { data: { meta } } = lastPage;
      const { page, totalPages } = meta;

      const nextPage = page + 1 > totalPages ? null : page + 1;
      return nextPage;
    },
  });

  const { data } = query;
  const { pages } = data || {};

  if (data) {
    placeholderDataRef.current = data;
  }

  return useMemo(() => {
    const parsedData = Array.isArray(pages) ? flatten(pages.map((p) => {
      const { data: { data: pageData } } = p;

      return pageData.map((d):AllItemProps => {
        const {
          id,
          name,
          met,
          metArea,
          coverageTarget,
          coverageTargetArea,
        } = d;

        return {
          id,
          name: name || 'Metadata name',
          current: {
            percent: met / 100,
            value: format('.3s')(metArea / 1000),
            unit: 'km2',
          },
          target: {
            percent: coverageTarget / 100,
            value: format('.3s')(coverageTargetArea / 1000),
            unit: 'km2',
          },
        };
      });
    })) : [];

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
  const [session] = useSession();

  const {
    filters = {},
    search,
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
    url: `/${sId}/marxan/solutions/gap-data`,
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

  const query = useInfiniteQuery(['post-gap-analysis', sId, JSON.stringify(options)], fetchFeatures, {
    placeholderData: placeholderDataRef.current,
    getNextPageParam: (lastPage) => {
      const { data: { meta } } = lastPage;
      const { page, totalPages } = meta;

      const nextPage = page + 1 > totalPages ? null : page + 1;
      return nextPage;
    },
  });

  const { data } = query;
  const { pages } = data || {};

  if (data) {
    placeholderDataRef.current = data;
  }

  return useMemo(() => {
    const parsedData = Array.isArray(pages) ? flatten(pages.map((p) => {
      const { data: { data: pageData } } = p;

      return pageData.map((d):AllItemProps => {
        const {
          id,
          name,
          met,
          metArea,
          coverageTarget,
          coverageTargetArea,
        } = d;

        return {
          id,
          name: name || 'Metadata name',
          current: {
            percent: met / 100,
            value: format('.3s')(metArea / 1000),
            unit: 'km2',
          },
          target: {
            percent: coverageTarget / 100,
            value: format('.3s')(coverageTargetArea / 1000),
            unit: 'km2',
          },
        };
      });
    })) : [];

    return {
      ...query,
      data: parsedData,
    };
  }, [query, pages]);
}
