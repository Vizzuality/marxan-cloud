import React from 'react';
import Head from 'next/head';

import Header from 'layout/header';
import Login from 'layout/login';

const Home: React.FC = () => {
  return (
    <>
      <Head>
        <title>Home</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Header size="lg" />

        <Login />
      </main>
    </>
  );
};

export default Home;
