import React from 'react';
import Head from 'next/head';

import { withProtection, withUser } from 'hoc/auth';

import Protected from 'layout/protected';
import Header from 'layout/header';

import ProjectsWelcome from 'layout/projects/welcome';
import ProjectsToolbar from 'layout/projects/toolbar';
import ProjectsList from 'layout/projects/list';

export const getServerSideProps = withProtection(withUser());

const ProjectsPage: React.FC = () => {
  return (
    <Protected>
      <Head>
        <title>Projects</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Header size="base" />

        <ProjectsWelcome />
        <ProjectsToolbar />
        <ProjectsList />
      </main>
    </Protected>
  );
};

export default ProjectsPage;
