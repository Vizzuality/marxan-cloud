import React from 'react';
import Head from 'next/head';

import Header from 'layout/header';
import Protected from 'layout/protected';

import ProjectsWelcome from 'layout/projects/welcome';
import ProjectsToolbar from 'layout/projects/toolbar';
import ProjectsList from 'layout/projects/list';

const ProjectsPage: React.FC = () => {
  return (
    <Protected>
      <Head>
        <title>Projects</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="relative">
        <Header size="base" />

        <ProjectsWelcome />
        <ProjectsToolbar />
        <ProjectsList />
      </main>
    </Protected>
  );
};

export default ProjectsPage;
