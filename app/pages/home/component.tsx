import React from 'react';
import Head from 'next/head';

import Header from 'components/header';

const About: React.FC = () => {
  return (
    <>
      <Head>
        <title>Home</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Header />
      </main>
    </>
  );
};

export default About;
