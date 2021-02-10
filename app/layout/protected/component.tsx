import React, { ReactNode } from 'react';

import { useRouter } from 'next/router';
import { useAuth } from 'hooks/authentication';

interface ProtectedProps {
  children: ReactNode
}

const Protected: React.FC = ({ children }: ProtectedProps) => {
  const { user, errorRedirect } = useAuth();
  const router = useRouter();

  if (!user) {
    router.push(errorRedirect);
    return null;
  }

  return (
    <>
      {children}
    </>
  );
};

export default Protected;
