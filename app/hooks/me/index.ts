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
  UseRequestRecoverPasswordProps,
  RequestRecoverPasswordProps,
  UseResetPasswordProps,
  ResetPasswordProps,
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
      user: data?.data,
    };
  }, [query, data?.data]);
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

// REQUEST RECOVER PASSWORD
export function useRequestRecoverPassword({
  requestConfig = {
    method: 'POST',
  },
}: UseRequestRecoverPasswordProps) {
  const requestRecoverPassword = ({ data }: RequestRecoverPasswordProps) => {
    return USERS.request({
      url: '/me/recover-password',
      data,
      ...requestConfig,
    });
  };

  return useMutation(requestRecoverPassword, {
    onSuccess: (data, variables, context) => {
      console.info('Succces', data, variables, context);
    },
    onError: (error, variables, context) => {
      console.info('Error', error, variables, context);
    },
  });
}

// RECOVER PASSWORD
export function useResetPassword({
  requestConfig = {
    method: 'PATCH',
  },
  resetToken,
}: UseResetPasswordProps) {
  const resetPassword = ({ data }: ResetPasswordProps) => {
    return USERS.request({
      url: '/me/reset-password',
      data,
      headers: {
        Authorization: `Bearer ${resetToken}`,
      },
      ...requestConfig,
    });
  };

  return useMutation(resetPassword, {
    onSuccess: (data, variables, context) => {
      console.info('Succces', data, variables, context);
    },
    onError: (error, variables, context) => {
      // An error happened!
      console.info('Error', error, variables, context);
    },
  });
}
