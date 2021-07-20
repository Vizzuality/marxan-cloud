import React from 'react';

import { useRouter } from 'next/router';

import { usePublishedProject } from 'hooks/projects';

import { withUser } from 'hoc/auth';
import { withPublishedProject } from 'hoc/projects';

import Contact from 'layout/statics/contact';
import Header from 'layout/header';
import Footer from 'layout/footer';
import MetaIcons from 'layout/meta-icons';
import MetaTags from 'layout/meta-tags';
import ProjectDetail from 'layout/community/published-projects/detail';
import PublishedProjectTitle from 'layout/title/published-project-title';

import MARXAN_SOCIAL_MEDIA_IMG from 'images/social-media/marxan-social-media.png';

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
        image={MARXAN_SOCIAL_MEDIA_IMG}
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
