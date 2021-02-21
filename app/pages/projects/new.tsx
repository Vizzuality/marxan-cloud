import React from 'react';
import Head from 'next/head';

import Header from 'layout/header';
import Protected from 'layout/protected';

const NewProjectsPage: React.FC = () => {
  return (
    <Protected>
      <Head>
        <title>New Project</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Header size="base" />
      </main>
    </Protected>
  );
};

export default NewProjectsPage;
