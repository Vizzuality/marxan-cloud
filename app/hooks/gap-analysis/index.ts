import { useQuery } from 'react-query';

import { sortBy } from 'lodash';
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

export function usePreGapAnalysis(sId: Scenario['id'], options: UseFeaturesOptionsProps = {}) {
  const { data: session } = useSession();

  const { filters = {}, search, sort } = options;

  const parsedFilters = Object.keys(filters).reduce((acc, k) => {
    return {
      ...acc,
      [`filter[${k}]`]: filters[k],
    };
  }, {});

  const fetchFeatures = () =>
    SCENARIOS.request({
      method: 'GET',
      url: `/${sId}/features/gap-data`,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      params: {
        ...parsedFilters,
        ...(search && {
          q: search,
        }),
        ...(sort && {
          sort,
        }),
        disablePagination: true,
      },
    }).then((response) => response.data);

  return useQuery(['pre-gap-analysis', sId, JSON.stringify(options)], fetchFeatures, {
    select: ({ data }) =>
      sortBy(
        data.map((d): AllItemProps => {
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
            },
            target: {
              percent: coverageTarget / 100,
            },
          };
        }),
        ['name']
      ),
  });
}

export function usePostGapAnalysis(sId, options: UseFeaturesOptionsProps = {}) {
  const { data: session } = useSession();

  const { filters = {}, search, sort } = options;

  const parsedFilters = Object.keys(filters).reduce((acc, k) => {
    return {
      ...acc,
      [`filter[${k}]`]: filters[k],
    };
  }, {});

  const fetchFeatures = () =>
    SCENARIOS.request({
      method: 'GET',
      url: `/${sId}/marxan/solutions/gap-data`,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      params: {
        ...parsedFilters,
        ...(search && {
          q: search,
        }),
        ...(sort && {
          sort,
        }),
        disablePagination: true,
      },
    }).then((response) => response.data);

  return useQuery(['post-gap-analysis', sId, JSON.stringify(options)], fetchFeatures, {
    enabled: !!filters.runId,
    placeholderData: { data: [] },
    select: ({ data }) =>
      data.map((d): AllItemProps => {
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
          },
          target: {
            percent: coverageTarget / 100,
          },
        };
      }),
  });
}
