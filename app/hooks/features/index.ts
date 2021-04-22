import Fuse from 'fuse.js';
import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useSession } from 'next-auth/client';

import orderBy from 'lodash/orderBy';
import flatten from 'lodash/flatten';

import { ItemProps as RawItemProps } from 'components/features/raw-item/component';
import { ItemProps as SelectedItemProps } from 'components/features/selected-item/component';

import PROJECTS from 'services/projects';
import SCENARIOS from 'services/scenarios';

import ITEMS from './mock';

import {
  UseFeaturesFiltersProps,
  UseSaveFeatureProps,
  SaveFeatureProps,
  UseDeleteFeatureProps,
  DeleteFeatureProps,
} from './types';

export function useAllFeatures(projectId, filters: UseFeaturesFiltersProps = {}) {
  const [session] = useSession();
  const { search } = filters;

  const query = useQuery(['all-features', projectId], async () => PROJECTS.request({
    method: 'GET',
    url: `/${projectId}/features`,
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  }));

  const { data } = query;

  return useMemo(() => {
    let parsedData = Array.isArray(data?.data) ? data?.data.map((d):RawItemProps => {
      const {
        id, alias, featureClassName, description, tag, source,
      } = d;

      return {
        id,
        name: alias || featureClassName,
        description: description || 'Donec est ad luctus dapibus sociosqu. Imperdiet platea viverra dui congue orci ad. Turpis a, dictumst eget. Justo potenti morbi iaculis habitasse justo aliquam tortor tellus nostra. Accumsan nunc lorem malesuada, eget sed magna habitasse laoreet rutrum non ante suscipit. Adipiscing quisque justo vel, et tellus suscipit purus. Mattis primis curae;, scelerisque parturient libero dictumst ad! Cras elit condimentum molestie sociis mauris. Pharetra tincidunt habitant imperdiet mauris vitae tempor sollicitudin pulvinar feugiat pharetra scelerisque? Purus erat penatibus adipiscing vestibulum fermentum et platea eros quis ad congue. Porta fringilla enim bibendum per tortor natoque ante suscipit. Congue.',
        tag,
        source,
      };
    }) : [];

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
    parsedData = orderBy(parsedData, ['name'], ['asc']);

    return {
      ...query,
      data: parsedData,
      rawData: data?.data,
    };
  }, [query, data?.data, search]);
}

export function useSelectedFeatures(filters: UseFeaturesFiltersProps = {}) {
  const [session] = useSession();
  const { search } = filters;

  const fetchFeatures = () => SCENARIOS.request({
    method: 'GET',
    url: '/',
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  });

  const query = useQuery(['selected-features'], fetchFeatures, { refetchOnWindowFocus: false });

  const { data } = query;

  return useMemo(() => {
    let parsedData = [];

    const {
      features = ITEMS,
    } = {};

    parsedData = features.map((d):SelectedItemProps => {
      const {
        id,
        name,
        type,
        description,
        splitOptions,
        splitSelected,
        splitFeaturesSelected,
        intersectFeaturesSelected,
      } = d;

      const splitFeaturesOptions = splitSelected ? splitOptions
        .find((s) => s.key === splitSelected).values
        .map((v) => ({ label: v.name, value: v.id }))
        : [];

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
        id,
        name,
        type: type === 'bioregional' ? 'bioregional' : 'species', // TODO: check why this is happening
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
      rawData: data?.data,
    };
  }, [query, data?.data, search]);
}

export function useTargetedFeatures() {
  const { data, ...rest } = useSelectedFeatures();

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
export function useFeature(id) {
  const [session] = useSession();

  const query = useQuery(['features', id], async () => SCENARIOS.request({
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
      data: data?.data,
    };
  }, [query, data?.data]);
}

export function useSaveFeature({
  requestConfig = {
    method: 'POST',
  },
}: UseSaveFeatureProps) {
  const queryClient = useQueryClient();
  const [session] = useSession();

  const saveFeature = ({ id, data }: SaveFeatureProps) => {
    return SCENARIOS.request({
      url: id ? `/${id}` : '/',
      data,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      ...requestConfig,
    });
  };

  return useMutation(saveFeature, {
    onSuccess: (data: any, variables, context) => {
      const { id, projectId } = data;
      queryClient.invalidateQueries(['features', projectId]);
      queryClient.invalidateQueries(['features', id]);
      console.info('Succces', data, variables, context);
    },
    onError: (error, variables, context) => {
      // An error happened!
      console.info('Error', error, variables, context);
    },
  });
}

export function useDeleteFeature({
  requestConfig = {
    method: 'DELETE',
  },
}: UseDeleteFeatureProps) {
  const [session] = useSession();

  const deleteFeature = ({ id }: DeleteFeatureProps) => {
    return SCENARIOS.request({
      method: 'DELETE',
      url: `/${id}`,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      ...requestConfig,
    });
  };

  return useMutation(deleteFeature, {
    onSuccess: (data, variables, context) => {
      console.info('Succces', data, variables, context);
    },
    onError: (error, variables, context) => {
      // An error happened!
      console.info('Error', error, variables, context);
    },
  });
}
