import React from 'react';

import Head from 'next/head';
import { useRouter } from 'next/router';

import { withUser } from 'hoc/auth';

import Utilities from 'layout/about/utilities';
import Values from 'layout/about/values';
import Footer from 'layout/footer';
import Header from 'layout/header';
import MetaIcons from 'layout/meta-icons';
import MetaTags from 'layout/meta-tags';
import Contact from 'layout/statics/contact';
import Hero from 'layout/statics/hero';

export const getServerSideProps = withUser();

const About: React.FC = () => {
  const { asPath } = useRouter();

  const DESCRIPTION_TEXT = 'Marxan is a suite of open-source decision-support tools that help structure, design and evaluate spatial planning projects for land, freshwater and ocean conservation. Marxan helps decision-making by balancing objectives such as protecting biodiversity and the benefits it provides to people, with socio-economic, cultural and political realities. As the analytic engine behind major planning projects, such as the Great Barrier Reef’s Rezoning Plan and Mongolia’s National Protected Area portfolio, Marxan leads the world in providing robust and flexible systematic decision-support to governments, practitioners and planners around the world.';
  const TITLE_TEXT = 'Spatial conservation planning with Marxan.';

  return (
    <>
      <Head>
        <title>About</title>
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
        <Header size="base" theme="light" />
        <Hero
          theme="light"
          title={TITLE_TEXT}
          description={DESCRIPTION_TEXT}
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
