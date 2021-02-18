import React from 'react';
import Head from 'next/head';

import Header from 'layout/header';
import Protected from 'layout/protected';

const EditScenarioPage: React.FC = () => {
  return (
    <Protected>
      <Head>
        <title>Edit Scenario</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Header size="base" />

      </main>
    </Protected>
  );
};

export default EditScenarioPage;
