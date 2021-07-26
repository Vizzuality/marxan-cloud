import React from 'react';
import Head from 'next/head';

import Title from 'layout/title/project-title';
import Header from 'layout/header';
import Protected from 'layout/protected';
import Help from 'layout/help/button';

import { withProtection, withUser } from 'hoc/auth';

export const getServerSideProps = withProtection(withUser());

const EditProjectsPage: React.FC = () => {
  return (
    <Protected>
      <Title title="Edit" />

      <Head>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Help />

      <main>
        <Header size="base" />
      </main>
    </Protected>
  );
};

export default EditProjectsPage;
