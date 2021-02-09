import { useMemo } from 'react';
import { useQuery } from 'react-query';
import { useAuth } from 'hooks/authentication';

import USERS from 'services/users';

export function useMe() {
  const { token } = useAuth();

  const query = useQuery('me', async () => USERS.request({
    method: 'GET',
    url: '/me',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }), {
    enabled: !!token,
  });

  const { data } = query;

  return useMemo(() => {
    return {
      ...query,
      user: data?.data,
    };
  }, [query, data?.data]);
}
