import React from 'react';
import Head from 'next/head';

import Backlink from 'layout/statics/backlink';
import Title from 'layout/title/project-title';
import Header from 'layout/header';

const PublishedProjectPage: React.FC = () => {
  return (
    <div>
      <Title title="" />
      <Head>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col w-screen h-screen">
        <Header size="base" />
        <Backlink href="/community/projects">
          Projects
        </Backlink>
      </main>
    </div>
  );
};

export default PublishedProjectPage;
