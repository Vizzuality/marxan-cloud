import React from 'react';

import Head from 'next/head';
import { useRouter } from 'next/router';

import { withUser } from 'hoc/auth';

import Footer from 'layout/footer';
import Header from 'layout/header';
import CarouselSection from 'layout/home/carousel-section';
import Features from 'layout/home/features';
import Hero from 'layout/home/hero';
import MetaIcons from 'layout/meta-icons';
import MetaTags from 'layout/meta-tags';

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
        <Header size="lg" theme="light" />
        <Hero />
        <Features />
        <CarouselSection />
        <Footer />
      </main>
    </>
  );
};

export default Home;
