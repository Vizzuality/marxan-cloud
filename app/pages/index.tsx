import React from 'react';
import Head from 'next/head';

import Header from 'layout/header';
import Footer from 'layout/footer';

import Hero from 'layout/home/hero';
import CarouselSection from 'layout/home/carousel-section';
import Features from 'layout/home/features';

import { withUser } from 'hoc/auth';

export const getServerSideProps = withUser();

const Home: React.FC = () => {
  return (
    <>
      <Head>
        <title>Home</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

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
