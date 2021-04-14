import Fuse from 'fuse.js';
import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useSession } from 'next-auth/client';

import orderBy from 'lodash/orderBy';

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

  const query = useQuery(['selected-features'], async () => FEATURES.request({
    method: 'GET',
    url: '/',
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  }));

  const { data } = query;

  return useMemo(() => {
    let parsedData = Array.isArray(data?.data) ? ITEMS.map((d):SelectedItemProps => {
      const {
        id, name, type, description,
      } = d;

      return {
        id,
        name,
        type: type === 'bioregional' ? 'bioregional' : 'species', // TODO: check why this is happening
        description,
        // SPLIT

        // splitSelected: 'attribute-1',
        // splitOptions: [
        //   { label: 'Attribute 1', value: 'attribute-1' },
        //   { label: 'Attribute 2', value: 'attribute-2' },
        //   { label: 'Attribute 3', value: 'attribute-3' },
        // ],
        // onSplitSelected: (selected) => console.info(selected),

        // splitFeaturesSelected: [],
        // splitFeaturesOptions: [
        //   { label: 'Deserts and Xeric Shrublands', value: 'id-1' },
        //   {
        //     label: 'Tropical and Subtropical Grasslands, Savannas and Shrublands',
        //     value: 'id-2',
        //   },
        //   { label: 'Flooded Grasslands and Savannas', value: 'id-3' },
        //   { label: 'Montane Grasslands and Shrublands', value: 'id-4' },
        //   {
        //     label: 'Tropical and Subtropical Moist, Broadleaf Forests',
        //     value: 'id-5',
        //   },
        //   { label: 'Mangroves', value: 'id-6' },
        // ],
        // onSplitFeaturesSelected: (selected) => console.info(selected),

        // INTEERESECTION

        // intersectFeaturesSelected: ['id-1', 'id-2'],
        // intersectFeaturesOptions: [
        //   { label: 'Deserts and Xeric Shrublands', value: 'id-1' },
        //   {
        //     label: 'Tropical and Subtropical Grasslands, Savannas and Shrublands',
        //     value: 'id-2',
        //   },
        // ],

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
    parsedData = orderBy(parsedData, ['type', 'name'], ['asc', 'asc']);

    return {
      ...query,
      data: parsedData,
      rawData: data?.data,
    };
  }, [query, data?.data, search]);
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
