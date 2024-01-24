import React from 'react';

import { useMe } from 'hooks/me';

import Wrapper from 'layout/wrapper';

export const ProjectsWelcome = (): JSX.Element => {
  const { data: user } = useMe();
  const { email, displayName } = user;

  return (
    <Wrapper>
      <h2 className="pb-10 pt-14 font-heading text-5xl text-white">
        Welcome, <strong>{displayName || email}</strong>
      </h2>
    </Wrapper>
  );
};

export default ProjectsWelcome;
