import React from 'react';
import Head from 'next/head';

import Contact from 'layout/explore/contact';
import Header from 'layout/header';
import Hero from 'layout/explore/hero';
import Footer from 'layout/footer';

import { withUser } from 'hoc/auth';

export const getServerSideProps = withUser();

const About: React.FC = () => {
  return (
    <>
      <Head>
        <title>About</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Header size="base" />
        <Hero
          section="About"
          title="Marxan introductory and short sentence."
          description="<p>Marxan exists to improve lorem ipsum dolor sit amet, consectetur adipiscing elit,
          sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
          veniam, quis nostrud exercitation.<br/><br/>
          All supported by lorem ipsum dolor sit amet, consectetur adipiscing elit,
          sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>"
        />
        <Contact />
        <Footer />
      </main>
    </>
  );
};

export default About;
