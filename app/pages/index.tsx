import React from 'react';
import Head from 'next/head';

import { useRouter } from 'next/router';

import Header from 'layout/header';
import Footer from 'layout/footer';

import Hero from 'layout/home/hero';
import CarouselSection from 'layout/home/carousel-section';
import Features from 'layout/home/features';
import MetaIcons from 'layout/meta-icons';
import MetaTags from 'layout/meta-tags';

import { withUser } from 'hoc/auth';

export const getServerSideProps = withUser();

const Home: React.FC = () => {
  const { asPath } = useRouter();
  return (
    <>
      <Head>
        <title>Home</title>
      </Head>

      <MetaIcons />

      <MetaTags
        name="Marxan conservation Solutions"
        title="Spatial conservation planning in the cloud"
        description="This platform supports decision-making for biodiversity and people on land, freshwater and ocean systems."
        url={`${process.env.NEXT_PUBLIC_VERCEL_URL}${asPath}`}
        type="article"
        twitterCard="summary"
        twitterSite="@Marxan_Planning"
      />
      <main>
        <Header size="lg" />
        <Hero />
        <Features />
        <CarouselSection />
        <Footer />
      </main>
    </>
  );
};

export default Home;
