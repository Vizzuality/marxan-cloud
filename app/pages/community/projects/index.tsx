import React from 'react';
import Head from 'next/head';

import { useRouter } from 'next/router';

import Contact from 'layout/statics/contact';
import Header from 'layout/header';
import Hero from 'layout/statics/hero';
import Footer from 'layout/footer';
import MetaIcons from 'layout/meta-icons';
import MetaTags from 'layout/meta-tags';
import PublishedProjects from 'layout/community/published-projects';

import { withUser } from 'hoc/auth';

export const getServerSideProps = withUser();

const CommunityProjects: React.FC = () => {
  const { asPath } = useRouter();

  const DESCRIPTION_TEXT = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';
  const TITLE_TEXT = 'Explore public projects and take them to your account.';

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
          backlink="/community"
        />
        <PublishedProjects />
        <Contact />
        <Footer />
      </main>
    </>
  );
};

export default CommunityProjects;
