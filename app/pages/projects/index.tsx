import React from 'react';

import { withProtection, withUser } from 'hoc/auth';

import Header from 'layout/header';
import Help from 'layout/help/button';
import MetaIcons from 'layout/meta-icons';
import ProjectsList from 'layout/projects/all/list';
import ProjectsToolbar from 'layout/projects/all/toolbar';
import ProjectsWelcome from 'layout/projects/all/welcome';
import Protected from 'layout/protected';
import ProjectTitle from 'layout/title/project-title';

export const getServerSideProps = withProtection(withUser());

const ProjectsPage: React.FC = () => {
  return (
    <Protected>
      <ProjectTitle title="" />

      <MetaIcons />

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
