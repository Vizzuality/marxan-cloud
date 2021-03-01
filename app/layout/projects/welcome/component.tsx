import React from 'react';

import Wrapper from 'layout/wrapper';
import { useAuth } from 'hooks/authentication';

export interface ProjectsWelcomeProps {

}

export const ProjectsWelcome: React.FC<ProjectsWelcomeProps> = () => {
  const auth = useAuth();
  const { user: { displayName } } = auth;

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
