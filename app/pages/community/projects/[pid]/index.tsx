import React from 'react';

import { useRouter } from 'next/router';

import { usePublishedProject } from 'hooks/projects';

import { withUser } from 'hoc/auth';
import { withPublishedProject } from 'hoc/projects';

import ProjectDetail from 'layout/community/published-projects/detail';
import Footer from 'layout/footer';
import Header from 'layout/header';
import MetaIcons from 'layout/meta-icons';
import MetaTags from 'layout/meta-tags';
import PublishedProjectTitle from 'layout/title/published-project-title';

export const getServerSideProps = withUser(withPublishedProject());

const PublishedProjectPage: React.FC = () => {
  const { query, asPath } = useRouter();
  const { pid } = query;

  const {
    data: publishedProject,
  } = usePublishedProject(pid);

  const {
    description, name,
  } = publishedProject || {};

  return (
    <>
      <PublishedProjectTitle />

      <MetaIcons />

      <MetaTags
        name="Marxan conservation Solutions"
        title={name}
        description={description}
        url={`${process.env.NEXT_PUBLIC_VERCEL_URL}${asPath}`}
        type="article"
        twitterCard="summary"
        twitterSite="@Marxan_Planning"
      />

      <main>
        <Header size="base" published />
        <ProjectDetail />
        <Footer />
      </main>
    </>
  );
};

export default PublishedProjectPage;
