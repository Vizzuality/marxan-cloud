import React from 'react';

import Wrapper from 'layout/wrapper';

import ProjectMap from 'layout/projects/map';
import ProjectForm from 'layout/projects/form';
import { NewProjectProps } from './types';

const NewProject: React.FC<NewProjectProps> = () => {
  return (
    <Wrapper>
      <div className="grid h-full grid-cols-1 gap-10 bg-gray-700 md:grid-cols-2 rounded-3xl">
        <ProjectForm />
        <ProjectMap />
      </div>
    </Wrapper>
  );
};

export default NewProject;
