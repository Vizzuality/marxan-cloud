import React from 'react';
import Head from 'next/head';

import { useRouter } from 'next/router';

import CommunityInfo from 'layout/community';
import Contact from 'layout/statics/contact';
import Header from 'layout/header';
import Hero from 'layout/statics/hero';
import Footer from 'layout/footer';
import MetaIcons from 'layout/meta-icons';
import MetaTags from 'layout/meta-tags';

import { withUser } from 'hoc/auth';

export const getServerSideProps = withUser();

const Community: React.FC = () => {
  const { asPath } = useRouter();

  const DESCRIPTION_TEXT = 'Marxan is the heart of an engaged and global community of thousands of practitioners, academics, planners and decision-makers. Sharing and learning from each other is how we advance and grow our community of practice. Explore our publicly shared projects to learn more about the variety of applications Marxan is helping to solve around the world.';
  const TITLE_TEXT = 'A community focused on outcomes.';

  return (
    <>
      <Head>
        <title>Community</title>
      </Head>

      <MetaIcons />

      <MetaTags
        name="Marxan conservation Solutions"
        title={TITLE_TEXT}
        description={DESCRIPTION_TEXT}
        url={`${process.env.NEXT_PUBLIC_VERCEL_URL}${asPath}`}
        type="article"
        twitterCard="summary"
        twitterSite="@Marxan_Planning"
      />

      <main>
        <Header size="base" />
        <Hero
          section="Community"
          title={TITLE_TEXT}
          description={DESCRIPTION_TEXT}
        />
        <CommunityInfo />
        <Contact />
        <Footer />
      </main>
    </>
  );
};

export default Community;
