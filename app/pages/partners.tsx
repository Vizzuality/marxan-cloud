import React from 'react';
import Head from 'next/head';

import Contact from 'layout/statics/contact';
import Header from 'layout/header';
import Hero from 'layout/statics/hero';
import Footer from 'layout/footer';
import PartnersList from 'layout/partners';

import { withUser } from 'hoc/auth';

export const getServerSideProps = withUser();

const Partners: React.FC = () => {
  return (
    <>
      <Head>
        <title>Partners</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex flex-col h-full md:flex-grow">
        <Header size="base" />
        <Hero
          section="Partners"
          title="Let’s grow the platform together lorem ipsum."
          description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
        />
        <PartnersList />
        <Contact />
        <Footer />
      </main>
    </>
  );
};

export default Partners;
