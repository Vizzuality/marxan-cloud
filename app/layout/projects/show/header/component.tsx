import React from 'react';

import Wrapper from 'layout/wrapper';

import { useRouter } from 'next/router';

import Title from 'layout/projects/show/header/title';
import Contributors from 'layout/projects/show/header/contributors';
import Toolbar from 'layout/projects/show/header/toolbar';

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
        <Title />

        <div className="flex flex-col items-end gap-6">
          <Contributors />
          <Toolbar />
        </div>
      </div>
    </Wrapper>
  );
};

export default ProjectsHeader;
