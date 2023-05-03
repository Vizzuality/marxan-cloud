import { useMemo } from 'react';

import { useSession } from 'next-auth/react';

export function useAccessToken() {
  const { data: session } = useSession();
  return useMemo(() => {
    return session.accessToken;
  }, [session.accessToken]);
}
