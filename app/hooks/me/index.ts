import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useSession } from 'next-auth/client';

import USERS from 'services/users';

import {
  UseSaveMeProps,
  SaveMeProps,
  UseSaveMePasswordProps,
  SaveMePasswordProps,
  UseDeleteMeProps,
} from './types';

// ME
export function useMe() {
  const [session, loading] = useSession();

  const query = useQuery('me', () => USERS.request({
    method: 'GET',
    url: '/me',
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  }).then((response) => {
    return response.data;
  }), {
    enabled: !!session && !loading,
  });

  const { data } = query;

  return useMemo(() => {
    return {
      ...query,
      user: data,
    };
  }, [query, data]);
}

// SAVE
export function useSaveMe({
  requestConfig = {
    method: 'PATCH',
  },
}: UseSaveMeProps) {
  const queryClient = useQueryClient();
  const [session] = useSession();

  const saveMe = ({ data }: SaveMeProps) => {
    return USERS.request({
      url: '/me',
      data,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      ...requestConfig,
    });
  };

  return useMutation(saveMe, {
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries('me');
      console.info('Succces', data, variables, context);
    },
    onError: (error, variables, context) => {
      // An error happened!
      console.info('Error', error, variables, context);
    },
  });
}

// SAVE
export function useSaveMePassword({
  requestConfig = {
    method: 'PATCH',
  },
}: UseSaveMePasswordProps) {
  const queryClient = useQueryClient();
  const [session] = useSession();

  const saveMe = ({ data }: SaveMePasswordProps) => {
    return USERS.request({
      url: '/me/password',
      data,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      ...requestConfig,
    });
  };

  return useMutation(saveMe, {
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries('me');
      console.info('Succces', data, variables, context);
    },
    onError: (error, variables, context) => {
      // An error happened!
      console.info('Error', error, variables, context);
    },
  });
}

// DELETE
export function useDeleteMe({
  requestConfig = {
    method: 'DELETE',
  },
}: UseDeleteMeProps) {
  const queryClient = useQueryClient();
  const [session] = useSession();

  const deleteMe = () => {
    return USERS.request({
      method: 'DELETE',
      url: '/me',
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      ...requestConfig,
    });
  };

  return useMutation(deleteMe, {
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries('me');
      console.info('Succces', data, variables, context);
    },
    onError: (error, variables, context) => {
      // An error happened!
      console.info('Error', error, variables, context);
    },
  });
}
