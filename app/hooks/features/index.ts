import Fuse from 'fuse.js';
import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useSession } from 'next-auth/client';

import orderBy from 'lodash/orderBy';

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

  const query = useQuery(['features'], async () => FEATURES.request({
    method: 'GET',
    url: '/',
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  }));

  const { data } = query;

  return useMemo(() => {
    let parsedData = Array.isArray(data?.data) ? ITEMS.map((d) => {
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
