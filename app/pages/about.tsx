import React from 'react';
import Head from 'next/head';

import Header from 'layout/header';

const About: React.FC = () => {
  return (
    <>
      <Head>
        <title>About</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Header theme="primary" />
      </main>
    </>
  );
};

export default About;
