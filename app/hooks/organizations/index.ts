import { useMemo, useRef } from 'react';

import {
  useQuery, useInfiniteQuery, useMutation, useQueryClient,
} from 'react-query';

import flatten from 'lodash/flatten';
import { useSession } from 'next-auth/client';

import ORGANIZATIONS from 'services/organizations';

import {
  UseOrganizationsOptionsProps,
  UseSaveOrganizationProps,
  SaveOrganizationProps,
  UseDeleteOrganizationProps,
  DeleteOrganizationProps,
} from './types';

export function useOrganizations(options: UseOrganizationsOptionsProps = {}) {
  const [session] = useSession();

  const placeholderDataRef = useRef({
    pages: [],
    pageParams: [],
  });

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

  const fetchOrganizations = ({ pageParam = 1 }) => ORGANIZATIONS.request({
    method: 'GET',
    url: '/',
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

  const query = useInfiniteQuery(['organizations', JSON.stringify(options)], fetchOrganizations, {
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

      return pageData.map((d) => {
        return d;
      });
    })) : [];

    return {
      ...query,
      data: parsedData,
    };
  }, [query, pages]);
}

export function useOrganization(id) {
  const [session] = useSession();

  const query = useQuery(['organizations', id], async () => ORGANIZATIONS.request({
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

export function useSaveOrganization({
  requestConfig = {
    method: 'POST',
  },
}: UseSaveOrganizationProps) {
  const queryClient = useQueryClient();
  const [session] = useSession();

  const saveOrganization = ({ id, data }: SaveOrganizationProps) => {
    return ORGANIZATIONS.request({
      url: id ? `/${id}` : '/',
      data,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      ...requestConfig,
    });
  };

  return useMutation(saveOrganization, {
    onSuccess: (data: any, variables, context) => {
      const { id, projectId } = data;
      queryClient.invalidateQueries(['organizations', projectId]);
      queryClient.invalidateQueries(['organizations', id]);
      console.info('Succces', data, variables, context);
    },
    onError: (error, variables, context) => {
      // An error happened!
      console.info('Error', error, variables, context);
    },
  });
}

export function useDeleteOrganization({
  requestConfig = {
    method: 'DELETE',
  },
}: UseDeleteOrganizationProps) {
  const [session] = useSession();

  const deleteOrganization = ({ id }: DeleteOrganizationProps) => {
    return ORGANIZATIONS.request({
      method: 'DELETE',
      url: `/${id}`,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      ...requestConfig,
    });
  };

  return useMutation(deleteOrganization, {
    onSuccess: (data, variables, context) => {
      console.info('Succces', data, variables, context);
    },
    onError: (error, variables, context) => {
      // An error happened!
      console.info('Error', error, variables, context);
    },
  });
}
