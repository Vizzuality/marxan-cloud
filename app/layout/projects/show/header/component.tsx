import React from 'react';

import { useRouter } from 'next/router';

import Contributors from 'layout/projects/show/header/contributors';
import Title from 'layout/projects/show/header/title';
import Toolbar from 'layout/projects/show/header/toolbar';
import Wrapper from 'layout/wrapper';

import Breadcrumb from 'components/breadcrumb';

export interface ProjectsHeaderProps {

}

export const ProjectsHeader: React.FC<ProjectsHeaderProps> = () => {
  const { push } = useRouter();

  return (
    <Wrapper>
      <Breadcrumb
        onClick={() => {
          push('/projects');
        }}
      >
        All projects
      </Breadcrumb>

      <div className="flex justify-between mt-5">
        <div className="flex-col w-2/4">
          <Title />
        </div>

        <div className="flex flex-col items-end flex-shrink-0 space-y-6">
          <Contributors />
          <Toolbar />
        </div>
      </div>
    </Wrapper>
  );
};

export default ProjectsHeader;
