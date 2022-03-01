import React from 'react';

import { useRouter } from 'next/router';

import { withUser } from 'hoc/auth';

import CommunityInfo from 'layout/community';
import Footer from 'layout/footer';
import Head from 'layout/head';
import Header from 'layout/header';
import MetaIcons from 'layout/meta-icons';
import MetaTags from 'layout/meta-tags';
import Hero from 'layout/statics/hero';

export const getServerSideProps = withUser();

const Community: React.FC = () => {
  const { asPath } = useRouter();

  const DESCRIPTION_TEXT = 'Marxan is the heart of an engaged and global community of thousands of practitioners, academics, planners and decision-makers. Sharing and learning from each other is how we advance and grow our community of practice. Explore our publicly shared projects to learn more about the variety of applications Marxan is helping to solve around the world.';
  const TITLE_TEXT = 'A community focused on outcomes.';

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
        <Hero
          section="Community"
          title={TITLE_TEXT}
          description={DESCRIPTION_TEXT}
          theme="light"
        />
        <CommunityInfo />
        <Footer />
      </main>
    </>
  );
};

export default Community;
