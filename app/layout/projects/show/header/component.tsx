import React from 'react';

import { useRouter } from 'next/router';

import Breadcrumb from 'components/breadcrumb';
import Contributors from 'layout/projects/show/header/contributors';
import Title from 'layout/projects/show/header/title';
import Toolbar from 'layout/projects/show/header/toolbar';
import UnderModeration from 'layout/projects/show/header/under-moderation';
import Wrapper from 'layout/wrapper';

export interface ProjectsHeaderProps {}

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

      <div className="mt-5 flex items-end justify-between space-x-10">
        <div>
          <UnderModeration />
          <Title />
        </div>

        <div className="flex flex-shrink-0 flex-col items-end space-y-6">
          <Contributors />
          <Toolbar />
        </div>
      </div>
    </Wrapper>
  );
};

export default ProjectsHeader;
