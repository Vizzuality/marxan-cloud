import React from 'react';

import { useMe } from 'hooks/me';

import Wrapper from 'layout/wrapper';

export interface ProjectsWelcomeProps {

}

export const ProjectsWelcome: React.FC<ProjectsWelcomeProps> = () => {
  const { user } = useMe();
  const { email, displayName } = user;

  return (
    <Wrapper>
      <h2 className="pb-10 text-5xl text-white pt-14 font-heading">
        Welcome,
        {' '}
        <strong>
          {displayName || email}
        </strong>
      </h2>
    </Wrapper>
  );
};

export default ProjectsWelcome;
