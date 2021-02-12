import React from 'react';
import Head from 'next/head';

import Header from 'layout/header';
import Projects from 'layout/projects';
import Protected from 'layout/protected';

const ProjectsPage: React.FC = () => {
  return (
    <Protected>
      <Head>
        <title>Projects</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Header size="base" />

        <Projects />
      </main>
    </Protected>
  );
};

export default ProjectsPage;
