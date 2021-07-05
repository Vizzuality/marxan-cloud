import React from 'react';
import Head from 'next/head';

import CommunityInfo from 'layout/community';
import Contact from 'layout/statics/contact';
import Header from 'layout/header';
import Hero from 'layout/statics/hero';
import Footer from 'layout/footer';

import { withUser } from 'hoc/auth';

export const getServerSideProps = withUser();

const Community: React.FC = () => {
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
          title="A community focused on outcomes."
          description="Marxan is the heart of an engaged and global community of thousands of practitioners, academics, planners and decision-makers.  Sharing and learning from each other is how we advance and grow our community of practice. Explore our publicly shared projects to learn more about the variety of applications Marxan is helping to solve around the world."
        />
        <CommunityInfo />
        <Contact />
        <Footer />
      </main>
    </>
  );
};

export default Community;
