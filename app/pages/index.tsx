import React from 'react';
import Head from 'next/head';

import Header from 'components/header';

export default function Home(): React.ReactNode {
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
}
