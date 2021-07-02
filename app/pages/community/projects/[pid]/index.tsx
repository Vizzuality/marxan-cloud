import React from 'react';
import Head from 'next/head';

import Title from 'layout/title/project-title';
import Header from 'layout/header';
import Help from 'layout/help/button';

const PublishedProjectPage: React.FC = () => {
  return (
    <div>
      <Title title="" />
      <Head>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col w-screen h-screen">
        <Header size="base" />
        Holaaaa project
        <Help />

      </main>
    </div>
  );
};

export default PublishedProjectPage;
