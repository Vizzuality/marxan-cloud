import React from 'react';
import Head from 'next/head';

import Contact from 'layout/statics/contact';
import Header from 'layout/header';
import Hero from 'layout/statics/hero';
import Footer from 'layout/footer';
import PublishedProjects from 'layout/community/published-projects';

import { withUser } from 'hoc/auth';

export const getServerSideProps = withUser();

const CommunityProjects: React.FC = () => {
  return (
    <>
      <Head>
        <title>Community</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Header size="base" />
        <Hero
          section="Community"
          title="Explore public projects and take them to your account."
          description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
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
