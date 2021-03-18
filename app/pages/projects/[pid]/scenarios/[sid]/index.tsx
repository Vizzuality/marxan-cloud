import React from 'react';

import Head from 'next/head';

import Title from 'layout/title/scenario-title';
import Header from 'layout/header';
import Protected from 'layout/protected';

import { withProtection, withUser } from 'hoc/auth';

export const getServerSideProps = withProtection(withUser());

const ShowScenarioPage: React.FC = () => {
  return (
    <Protected>
      <Title />

      <Head>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Header size="base" />

      </main>
    </Protected>
  );
};

export default ShowScenarioPage;
