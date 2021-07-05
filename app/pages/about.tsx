import React from 'react';
import Head from 'next/head';

import Contact from 'layout/statics/contact';
import Header from 'layout/header';
import Hero from 'layout/statics/hero';
import Footer from 'layout/footer';
import Utilities from 'layout/about/utilities';
import Values from 'layout/about/values';

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
          title="Spatial conservation planning with Marxan."
          description="Marxan is a suite of open-source decision-support tools that help structure, design and evaluate spatial planning projects for land, freshwater and ocean conservation. Marxan helps decision-making by balancing objectives such as protecting biodiversity and the benefits it provides to people, with socio-economic, cultural and political realities. As the analytic engine behind major planning projects, such as the Great Barrier Reef’s Rezoning Plan and Mongolia’s National Protected Area portfolio, Marxan leads the world in providing robust and flexible systematic decision-support to governments, practitioners and planners around the world."
        />
        <Utilities />
        <Values />
        <Contact />
        <Footer />
      </main>
    </>
  );
};

export default About;
