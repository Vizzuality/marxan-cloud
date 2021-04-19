import Fuse from 'fuse.js';
import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useSession } from 'next-auth/client';

import orderBy from 'lodash/orderBy';
import flatten from 'lodash/flatten';

import { ItemProps as RawItemProps } from 'components/features/raw-item/component';
import { ItemProps as SelectedItemProps } from 'components/features/selected-item/component';

import FEATURES from 'services/scenarios';

import ITEMS from './mock';

import {
  UseFeaturesFiltersProps,
  UseSaveFeatureProps,
  SaveFeatureProps,
  UseDeleteFeatureProps,
  DeleteFeatureProps,
} from './types';

export function useAllFeatures(filters: UseFeaturesFiltersProps = {}) {
  const [session] = useSession();
  const { search } = filters;

  const query = useQuery(['all-features'], async () => FEATURES.request({
    method: 'GET',
    url: '/',
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  }));

  const { data } = query;

  return useMemo(() => {
    let parsedData = Array.isArray(data?.data) ? ITEMS.map((d):RawItemProps => {
      const {
        id, name, description, tags,
      } = d;

      return {
        id,
        name,
        description,
        tags,
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

  const fetchFeatures = () => FEATURES.request({
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
        .map((v) => ({ label: v.id, value: v.value }))
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
        id, name, splitSelected, splitOptions, splitFeaturesSelected,
      } = s;
      const isSplitted = !!splitSelected;

      if (isSplitted) {
        const splitFeaturesOptions = splitOptions
          .find((v) => v.key === splitSelected).values
          .map((v) => ({ label: v.id, value: v.value }));

        return splitFeaturesSelected.map((sf) => {
          const { id: sfId } = sf;
          const { label: sfName } = splitFeaturesOptions.find((v) => v.value === sfId);

          return {
            ...sf,
            id: `${id}-${sfId}`,
            type: 'bioregional',
            name: `${name} / ${sfName}`,
            splitted: true,
          };
        });
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

  const query = useQuery(['features', id], async () => FEATURES.request({
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
    return FEATURES.request({
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
    return FEATURES.request({
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
