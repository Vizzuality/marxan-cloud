import React from 'react';

import { withProtection, withUser } from 'hoc/auth';

import Protected from 'layout/protected';
import Header from 'layout/header';
import ProjectTitle from 'layout/title/project-title';

import ProjectsWelcome from 'layout/projects/all/welcome';
import ProjectsToolbar from 'layout/projects/all/toolbar';
import ProjectsList from 'layout/projects/all/list';
import Help from 'layout/help/button';

export const getServerSideProps = withProtection(withUser());

const ProjectsPage: React.FC = () => {
  return (
    <Protected>
      <ProjectTitle title="" />

      <main>
        <Header size="base" />

        <ProjectsWelcome />
        <ProjectsToolbar />
        <ProjectsList />

        <Help />
      </main>
    </Protected>
  );
};

export default ProjectsPage;
