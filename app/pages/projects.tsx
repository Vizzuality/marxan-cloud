import React from 'react';
import Head from 'next/head';

import { useRouter } from 'next/router';
import { useAuth } from 'hooks/authentication';

import Header from 'layout/header';
import Projects from 'layout/projects';

const ProjectsPage: React.FC = () => {
  const { user, errorRedirect } = useAuth();
  const router = useRouter();

  if (!user) {
    router.push(errorRedirect);
    return null;
  }

  return (
    <>
      <Head>
        <title>Projects</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Header size="base" />

        <Projects />
      </main>
    </>
  );
};

export default ProjectsPage;
