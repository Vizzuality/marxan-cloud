import React from 'react';

import { useRouter } from 'next/router';

import Breadcrumb from 'components/breadcrumb';
import Title from 'layout/projects/show/header/title';
import Toolbar from 'layout/projects/show/header/toolbar';
import UnderModeration from 'layout/projects/show/header/under-moderation';

export interface ProjectsHeaderProps {}

export const ProjectsHeader: React.FC<ProjectsHeaderProps> = () => {
  const { push } = useRouter();

  return (
    <>
      <Breadcrumb
        onClick={() => {
          push('/projects');
        }}
      >
        All projects
      </Breadcrumb>

      <div className="mt-5 flex flex-col justify-between space-x-10">
        <div>
          <UnderModeration />
          <Title />
        </div>

        <div className="flex flex-shrink-0 flex-col items-end space-y-6">
          <Toolbar />
        </div>
      </div>
    </>
  );
};

export default ProjectsHeader;
