import React from 'react';
import Head from 'next/head';

import Header from 'layout/header';

const Home: React.FC = () => {
  return (
    <>
      <Head>
        <title>Home</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Header theme="home" />
      </main>
    </>
  );
};

export default Home;
