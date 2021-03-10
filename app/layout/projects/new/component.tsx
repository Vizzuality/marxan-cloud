import React from 'react';

import Wrapper from 'layout/wrapper';

import ProjectMap from 'layout/projects/map';
import ProjectForm from 'layout/projects/form';
import { NewProjectProps } from './types';

const NewProject: React.FC<NewProjectProps> = () => {
  return (
    <main className="flex flex-col w-screen h-screen">
      <div className="pt-2.5 pb-10 md:flex-grow">
        <Wrapper>
          <div className="grid h-full grid-cols-1 gap-10 mt-2 bg-gray-700 md:grid-cols-2 rounded-3xl">
            <ProjectForm />
            <ProjectMap />
          </div>
        </Wrapper>
      </div>
    </main>
  );
};

export default NewProject;
