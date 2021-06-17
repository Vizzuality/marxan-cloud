import { useMemo, useRef } from 'react';
import {
  useInfiniteQuery,
} from 'react-query';
import { useSession } from 'next-auth/client';

import flatten from 'lodash/flatten';

import { ItemProps as RawItemProps } from 'components/gap-analysis/item/component';

import PROJECTS from 'services/projects';

import {
  UseFeaturesOptionsProps,
} from './types';

interface AllItemProps extends RawItemProps {}

export function useGapAnalysis(projectId, options: UseFeaturesOptionsProps = {}) {
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

  const fetchFeatures = ({ pageParam = 1 }) => PROJECTS.request({
    method: 'GET',
    url: `/${projectId}/features`,
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

  const query = useInfiniteQuery(['gap-analysis', projectId, JSON.stringify(options)], fetchFeatures, {
    retry: false,
    placeholderData: placeholderDataRef.current,
    getNextPageParam: (lastPage) => {
      const { data: { meta } } = lastPage;
      const { page, totalPages } = meta;

      const nextPage = page + 1 > totalPages ? null : page + 1;
      return nextPage;
    },
  });

  const { data, error } = query;
  const { pages } = data || {};

  if (data || error) {
    placeholderDataRef.current = data;
  }

  return useMemo(() => {
    const parsedData = Array.isArray(pages) ? flatten(pages.map((p) => {
      const { data: { data: pageData } } = p;

      return pageData.map((d):AllItemProps => {
        const {
          id,
          alias,
          featureClassName,
        } = d;

        return {
          id,
          name: alias || featureClassName,
          current: {
            percent: 0.5,
            value: 400,
            unit: 'km2',
          },
          target: {
            percent: 0.40,
            value: 350,
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
