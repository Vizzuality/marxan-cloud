import React from 'react';

import Wrapper from 'layout/wrapper';
import { useMe } from 'hooks/me';

export interface ProjectsWelcomeProps {

}

export const ProjectsWelcome: React.FC<ProjectsWelcomeProps> = () => {
  const { user } = useMe();
  console.log(user);

  return null;

  const { displayName } = user;

  return (
    <Wrapper>
      <h2 className="pb-10 text-5xl text-white pt-14 font-heading">
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
