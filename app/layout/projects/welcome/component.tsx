import React from 'react';

import Wrapper from 'layout/wrapper';
import { useSession } from 'next-auth/client';

export interface ProjectsWelcomeProps {

}

export const ProjectsWelcome: React.FC<ProjectsWelcomeProps> = () => {
  const [session, loading] = useSession();
  const { user: { displayName } } = session;

  // prevent show anything while session is loading
  if (!session && loading) return null;

  return (
    <Wrapper>
      <h2 className="py-10 text-5xl text-center text-white font-heading">
        Welcome,
        {' '}
        <strong>
          {displayName}
        </strong>
      </h2>
    </Wrapper>
  );
};

export default ProjectsWelcome;
