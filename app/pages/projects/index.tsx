import React from 'react';

import { withProtection, withUser } from 'hoc/auth';

import Header from 'layout/header';
import DocumentationLink from 'layout/help/documentation';
import MetaIcons from 'layout/meta-icons';
import ProjectLayout from 'layout/project';
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

      <ProjectLayout className="justify-center">
        <main className="flex flex-col">
          <Header size="base" />

          <ProjectsWelcome />
          <ProjectsToolbar />
          <ProjectsList />

          <DocumentationLink />
        </main>
      </ProjectLayout>
    </Protected>
  );
};

export default ProjectsPage;
