import React from 'react';

import { useRouter } from 'next/router';

import { withUser } from 'hoc/auth';

import PublishedProjects from 'layout/community/published-projects/list';
import Footer from 'layout/footer';
import Head from 'layout/head';
import Header from 'layout/header';
import MetaIcons from 'layout/meta-icons';
import MetaTags from 'layout/meta-tags';
import Hero from 'layout/statics/hero';

export const getServerSideProps = withUser();

const CommunityProjects: React.FC = () => {
  const { asPath } = useRouter();

  const DESCRIPTION_TEXT =
    'Marxan trainings and real-world examples are here for your exploration! Learn how others use Marxan for research and planning. Select a project to copy into your account for see how others set targets, build scenaris and create Marxan plans around the world.';
  const TITLE_TEXT = 'Explore public projects and take them to your account.';

  return (
    <>
      <Head title="Community" />

      <MetaIcons />

      <MetaTags
        name="Marxan conservation Solutions"
        title={TITLE_TEXT}
        description={DESCRIPTION_TEXT}
        url={`${process.env.NEXT_PUBLIC_VERCEL_URL || process.env.NEXT_PUBLIC_URL}${asPath}`}
        type="article"
        twitterCard="summary"
        twitterSite="@Marxan_Planning"
      />

      <main>
        <Header size="base" theme="light" />
        <Hero section="Community" title={TITLE_TEXT} description={DESCRIPTION_TEXT} theme="light" />
        <PublishedProjects />
        <Footer />
      </main>
    </>
  );
};

export default CommunityProjects;
