import { useMemo } from 'react';

import { useSession } from 'next-auth/client';

export function useAccessToken() {
  const [session] = useSession();
  return useMemo(() => {
    return session.accessToken;
  }, [session.accessToken]);
}
