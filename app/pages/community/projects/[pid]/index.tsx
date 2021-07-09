import React from 'react';
import Head from 'next/head';

import ProjectDetail from 'layout/community/published-projects/detail';
import Header from 'layout/header';
import Title from 'layout/title/project-title';

const PublishedProjectPage: React.FC = () => {
  return (
    <div>
      <Title title="" />
      <Head>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col w-screen h-screen">
        <Header size="base" published />
        <ProjectDetail />
      </main>
    </div>
  );
};

export default PublishedProjectPage;
