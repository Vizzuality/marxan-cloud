import React from 'react';
import Head from 'next/head';

import Contact from 'layout/statics/contact';
import Header from 'layout/header';
import Footer from 'layout/footer';
import ProjectDetail from 'layout/community/published-projects/detail';
import Title from 'layout/title/project-title';

const PublishedProjectPage: React.FC = () => {
  return (
    <>
      <Title title="" />
      <Head>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Header size="base" published />
        <ProjectDetail />
        <Contact />
        <Footer />
      </main>
    </>
  );
};

export default PublishedProjectPage;
