import React from 'react';
import Head from 'next/head';

import { getSession } from 'next-auth/client';

import Protected from 'layout/protected';
import Header from 'layout/header';

import ProjectsWelcome from 'layout/projects/welcome';
import ProjectsToolbar from 'layout/projects/toolbar';
import ProjectsList from 'layout/projects/list';

export async function getServerSideProps(context) {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: '/auth/sign-in', // referer url
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}

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
