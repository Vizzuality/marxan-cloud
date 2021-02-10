import React from 'react';
import Head from 'next/head';

import Header from 'layout/header';
import Login from 'layout/login';
import Wrapper from 'layout/wrapper';

const Home: React.FC = () => {
  return (
    <>
      <Head>
        <title>Home</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Header size="lg" />

        <Wrapper>
          <Login />
        </Wrapper>
      </main>
    </>
  );
};

export default Home;
