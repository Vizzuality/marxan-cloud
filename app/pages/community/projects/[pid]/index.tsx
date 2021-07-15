import React from 'react';
import Head from 'next/head';

import { useRouter } from 'next/router';

import { usePublishedProject } from 'hooks/projects';

import Contact from 'layout/statics/contact';
import Header from 'layout/header';
import Footer from 'layout/footer';
import MetaTags from 'layout/meta-tags';
import ProjectDetail from 'layout/community/published-projects/detail';

const PublishedProjectPage: React.FC = () => {
  const { asPath } = useRouter();
  const { query } = useRouter();
  const { pid } = query;

  const {
    data: publishedProject,
    isFetched: publishedProjectIsFetched,
  } = usePublishedProject(pid);

  const {
    description, name,
  } = publishedProject || {};

  const dataIsFectched = publishedProject && publishedProjectIsFetched;
  return (
    <>
      {dataIsFectched && (
        <MetaTags
          name="Marxan conservation Solutions"
          title={name}
          description={description}
          url={`${window.location.origin}${asPath}`}
          type="article"
          twitterCard="summary"
          twitterSite="@Marxan_Planning"
        />
      )}

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
