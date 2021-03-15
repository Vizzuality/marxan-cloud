import React, { ReactNode } from 'react';

import { useSession } from 'next-auth/client';
import { useRouter } from 'next/router';

// const TIME_INTERVAL = 1000 * 60 * 10; // 10 min
// const SESSION_BUFFER_TIME = 30 * 60 * 1000; // 30 min

interface ProtectedProps {
  children: ReactNode
}

const Protected: React.FC = ({ children }: ProtectedProps) => {
  const router = useRouter();
  const [session, loading] = useSession();

  // // every 10 min check session expiration
  // useInterval(() => {
  //   // When 30 min left for token expiration, request a new token
  //   const current = Date.now() - SESSION_BUFFER_TIME;
  //   const sessionExpiration = new Date(session.expires).getTime();
  //   const tokenIsCloseToExpire = current > sessionExpiration;
  //   if (tokenIsCloseToExpire) {
  //     signIn(); // Token refresh using already existing login data
  //   }
  // }, TIME_INTERVAL);

  // Not display anything when session request is on progress
  if (loading) return null;

  // Redirect when session doesn't exist
  if (!loading && !session) {
    router.push(`/auth/sign-in?callbackUrl=${window.location.origin}${router.asPath}`);
    return null;
  }

  return (
    <>
      {children}
    </>
  );
};

export default Protected;
