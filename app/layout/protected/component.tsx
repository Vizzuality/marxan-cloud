import React, { ReactNode } from 'react';

import { useSession } from 'next-auth/client';
import { useRouter } from 'next/router';

interface ProtectedProps {
  children: ReactNode
}

const Protected: React.FC = ({ children }: ProtectedProps) => {
  const router = useRouter();
  const [session, loading] = useSession();

  // Not display anything when session request is on progress
  if (loading) return null;

  // Redirect when session doesn't exist
  if (!loading && !session) {
    router.push('/auth/sign-in');
    return null;
  }

  return (
    <>
      {children}
    </>
  );
};

export default Protected;
