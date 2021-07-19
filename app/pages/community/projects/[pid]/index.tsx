import React from 'react';
import Head from 'next/head';

import { useRouter } from 'next/router';

import { usePublishedProject } from 'hooks/projects';

import { withUser } from 'hoc/auth';
import { withPublishedProject } from 'hoc/projects';

import Contact from 'layout/statics/contact';
import Header from 'layout/header';
import Footer from 'layout/footer';
import MetaTags from 'layout/meta-tags';
import ProjectDetail from 'layout/community/published-projects/detail';
import PublishedProjectTitle from 'layout/title/published-project-title';

export const getServerSideProps = withUser(withPublishedProject());

const PublishedProjectPage: React.FC = () => {
  const { asPath } = useRouter();
  const { query } = useRouter();
  const { pid } = query;

  const {
    data: publishedProject,
  } = usePublishedProject(pid);

  const {
    description, name,
  } = publishedProject || {};

  return (
    <>

      <PublishedProjectTitle title={name} />

      <Head>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <MetaTags
        name="Marxan conservation Solutions"
        title={name}
        description={description}
        url={asPath}
        image="https://ipbes.net/sites/default/files/screen_shot_2017-11-19_at_20.20.14.png"
        type="article"
        twitterCard="summary"
        twitterSite="@Marxan_Planning"
      />

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
