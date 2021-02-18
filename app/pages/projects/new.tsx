import React from 'react';
import Head from 'next/head';

import Header from 'layout/header';
import Protected from 'layout/protected';

import NewProject from 'layout/projects/new';

const NewProjectsPage: React.FC = () => {
  return (
    <Protected>
      <Head>
        <title>New Project</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Header size="base" />
        <NewProject />
      </main>
    </Protected>
  );
};

export default NewProjectsPage;
