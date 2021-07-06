import Fuse from 'fuse.js';
import { useMemo } from 'react';
import {
  useQuery, useInfiniteQuery, useMutation, useQueryClient,
} from 'react-query';
import { useSession } from 'next-auth/client';

import orderBy from 'lodash/orderBy';
import flatten from 'lodash/flatten';

import { ItemProps as RawItemProps } from 'components/features/raw-item/component';
import { ItemProps as SelectedItemProps } from 'components/features/selected-item/component';
import { ItemProps as IntersectItemProps } from 'components/features/intersect-item/component';

import PROJECTS from 'services/projects';
import SCENARIOS from 'services/scenarios';
import GEOFEATURES from 'services/geo-features';

import {
  UseFeaturesFiltersProps,
  UseFeaturesOptionsProps,
  UseSaveSelectedFeaturesProps,
  SaveSelectedFeaturesProps,
} from './types';

interface AllItemProps extends IntersectItemProps, RawItemProps {}

export function useAllFeatures(projectId, options: UseFeaturesOptionsProps = {}) {
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
        [`filter[${k}]`]: filters[k].toString(),
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

  const query = useInfiniteQuery(['all-features', projectId, JSON.stringify(options)], fetchFeatures, {
    retry: false,
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

      return pageData.map((d):AllItemProps => {
        const {
          id,
          alias,
          featureClassName,
          description,
          tag,
          source,
          properties,
          splitSelected,
          splitFeaturesSelected,
        } = d;

        let splitOptions = [];
        let splitFeaturesOptions = [];

        if (tag === 'bioregional') {
          splitOptions = Object.keys(properties).map((k) => {
            return {
              key: k,
              label: k,
              values: properties[k].map((v) => ({ id: v, name: v })),
            };
          });

          splitFeaturesOptions = splitSelected ? splitOptions
            .find((s) => s.key === splitSelected).values
            .map((v) => ({ label: v.name, value: v.id }))
            : [];
        }

        return {
          id,
          name: alias || featureClassName,
          description,
          tag,
          source,

          splitSelected,
          splitOptions,
          splitFeaturesSelected,
          splitFeaturesOptions,
        };
      });
    })) : [];

    return {
      ...query,
      data: parsedData,
    };
  }, [query, pages]);
}

export function useSelectedFeatures(sid, filters: UseFeaturesFiltersProps = {}) {
  const [session] = useSession();
  const { search } = filters;

  const fetchFeatures = () => SCENARIOS.request({
    method: 'GET',
    url: `/${sid}/features/specification`,
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  });

  const query = useQuery(['selected-features', sid], fetchFeatures, {
    refetchOnWindowFocus: false,
  });

  const { data } = query;

  return useMemo(() => {
    let parsedData = data?.data?.data || {};

    const {
      features = [],
    } = parsedData;

    parsedData = features.map((d):SelectedItemProps => {
      const {
        featureId,
        geoprocessingOperations,
        metadata,
      } = d;

      const {
        alias,
        featureClassName,
        tag,
        description,
        properties,

        intersectFeaturesSelected,
      } = metadata;

      let splitOptions = [];
      let splitFeaturesOptions = [];
      let splitSelected;
      let splitFeaturesSelected = [];

      if (tag === 'bioregional') {
        splitOptions = Object.keys(properties).map((k) => {
          return {
            key: k,
            label: k,
            values: properties[k].map((v) => ({ id: v, name: v })),
          };
        });

        if (geoprocessingOperations && geoprocessingOperations[0].kind === 'split/v1') {
          splitSelected = geoprocessingOperations[0].splitByProperty;

          splitFeaturesOptions = splitSelected ? splitOptions
            .find((s) => s.key === splitSelected).values
            .map((v) => ({ label: v.name, value: v.id }))
            : [];

          splitFeaturesSelected = geoprocessingOperations[0].splits.map((s) => {
            return {
              id: s.value,
              name: s.value,
            };
          });
        }
      }

      const intersectFeaturesOptions = intersectFeaturesSelected ? flatten(intersectFeaturesSelected
        .map((ifs) => {
          const {
            id: ifsId,
            name: ifsName,
            splitSelected: ifsSplitSelected,
            splitFeaturesSelected: ifsSplitFeaturesSelected,
          } = ifs;

          if (ifsSplitSelected) {
            return ifsSplitFeaturesSelected.map((v) => {
              return {
                label: v.name,
                value: v.id,
              };
            });
          }

          return {
            label: ifsName,
            value: ifsId,
          };
        }))
        : [];

      return {
        ...d,
        id: featureId,
        name: alias || featureClassName,
        type: tag,
        description,

        // SPLIT
        splitOptions,
        splitSelected,
        splitFeaturesSelected,
        splitFeaturesOptions,

        // INTERESECTION
        intersectFeaturesSelected,
        intersectFeaturesOptions,
      };
    });

    // Filter
    if (search) {
      const fuse = new Fuse(parsedData, {
        keys: ['name'],
        threshold: 0.25,
      });
      parsedData = fuse.search(search).map((f) => {
        return f.item;
      });
    }

    // Sort
    parsedData = orderBy(parsedData, ['type', 'name'], ['asc', 'asc']);

    return {
      ...query,
      data: parsedData,
      rawData: data?.data?.data,
    };
  }, [query, data?.data?.data, search]);
}

export function useTargetedFeatures(sid) {
  const { data, ...rest } = useSelectedFeatures(sid);

  return useMemo(() => {
    const features = flatten(data.map((s) => {
      const {
        id, name, splitSelected, splitFeaturesSelected, intersectFeaturesSelected,
      } = s;
      const isSplitted = !!splitSelected;
      const isIntersected = !!intersectFeaturesSelected;

      // Generate splitted features to target
      if (isSplitted) {
        return splitFeaturesSelected.map((sf) => {
          const { id: sfId, name: sfName } = sf;

          return {
            ...sf,
            id: `${id}-${sfId}`,
            type: 'bioregional',
            name: `${name} / ${sfName}`,
            splitted: true,
          };
        });
      }

      if (isIntersected) {
        return flatten(intersectFeaturesSelected.map((ifs) => {
          const {
            id: ifId,
            name: ifName,
            splitSelected: ifSplitSelected,
            splitFeaturesSelected: ifSplitFeaturesSelected,
          } = ifs;

          if (ifSplitSelected) {
            return ifSplitFeaturesSelected.map((sf) => {
              const { id: sfId, name: sfName } = sf;

              return {
                ...sf,
                id: `${id}-${sfId}`,
                type: 'bioregional-and-species',
                name: `${name} in ${sfName}`,
                splitted: true,
              };
            });
          }

          return {
            ...ifs,
            id: `${id}-${ifId}`,
            type: 'bioregional-and-species',
            name: `${name} / ${ifName}`,
            splitted: true,
          };
        }));
      }

      return s;
    }));

    return {
      ...rest,
      data: features,
    };
  }, [data, rest]);
}

export function useSaveSelectedFeatures({
  requestConfig = {
    method: 'PUT',
  },
}: UseSaveSelectedFeaturesProps) {
  const queryClient = useQueryClient();
  const [session] = useSession();

  const saveFeature = ({ id, data }: SaveSelectedFeaturesProps) => {
    return SCENARIOS.request({
      url: `/${id}/features/specification`,
      data,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      ...requestConfig,
    });
  };

  return useMutation(saveFeature, {
    onSuccess: (data: any, variables, context) => {
      queryClient.invalidateQueries(['selected-features']);

      console.info('Succces', data, variables, context);
    },
    onError: (error, variables, context) => {
      // An error happened!
      console.info('Error', error, variables, context);
    },
  });
}

export function useFeature(id) {
  const [session] = useSession();

  const query = useQuery(['features', id], async () => GEOFEATURES.request({
    method: 'GET',
    url: `/${id}`,
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  }), {
    enabled: !!id,
  });

  const { data } = query;

  return useMemo(() => {
    return {
      ...query,
      data: data?.data?.data,
    };
  }, [query, data?.data?.data]);
}
