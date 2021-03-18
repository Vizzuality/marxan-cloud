import React from 'react';
import Head from 'next/head';

import Header from 'layout/header';
import { withUser } from 'hoc/auth';

export const getServerSideProps = withUser();

const Home: React.FC = () => {
  return (
    <>
      <Head>
        <title>Home</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Header size="lg" />
      </main>
    </>
  );
};

export default Home;
