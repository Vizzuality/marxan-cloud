import React from 'react';

import { useRouter } from 'next/router';

import Title from 'layout/header/title';
import ComingSoon from 'layout/help/coming-soon';
import Contributors from 'layout/projects/show/header/contributors';
import Description from 'layout/projects/show/header/description';
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
        <div className="flex-col">
          <Title />
          <Description />
        </div>

        <div className="flex flex-col items-end flex-shrink-0 space-y-6">
          <ComingSoon>
            <Contributors />
          </ComingSoon>
          <Toolbar />
        </div>
      </div>
    </Wrapper>
  );
};

export default ProjectsHeader;
