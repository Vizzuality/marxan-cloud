import React from 'react';
import Head from 'next/head';

import { withProtection, withUser } from 'hoc/auth';

import Protected from 'layout/protected';
import Header from 'layout/header';
import Title from 'layout/title/project-title';

import ProjectsWelcome from 'layout/projects/all/welcome';
import ProjectsToolbar from 'layout/projects/all/toolbar';
import ProjectsList from 'layout/projects/all/list';
import Help from 'layout/help/button';

export const getServerSideProps = withProtection(withUser());

const ProjectsPage: React.FC = () => {
  return (
    <Protected>
      <Title title="" />

      <Head>
        <link rel="icon" href="/favicon.ico" />
      </Head>

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
