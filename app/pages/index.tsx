import React from 'react';
import Head from 'next/head';

import Header from 'components/header';
import Icon from 'components/icon';

import INFO_SVG from 'svgs/ui/info.svg?sprite';

const Home: React.FC = () => {
  return (
    <>
      <Head>
        <title>Home</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Header />
        <Icon icon={INFO_SVG} className="w-5 h-5 text-blue-500" />
      </main>
    </>
  );
};

export default Home;
