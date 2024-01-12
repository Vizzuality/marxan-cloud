import React from 'react';

import { useRouter } from 'next/router';

import { withUser } from 'hoc/auth';

import Footer from 'layout/footer';
import Head from 'layout/head';
import Header from 'layout/header';
import Banner from 'layout/home/banner';
import Features from 'layout/home/features';
import Intro from 'layout/home/intro';
import PartnersList from 'layout/home/partners';
import Support from 'layout/home/support';
import MetaIcons from 'layout/meta-icons';
import MetaTags from 'layout/meta-tags';
import UpcomingChanges from 'layout/upcoming-changes';

export const getServerSideProps = withUser();

const Home = (): JSX.Element => {
  const { asPath } = useRouter();

  return (
    <>
      <Head title="Home" />

      <MetaIcons />

      <MetaTags
        name="Marxan conservation Solutions"
        title="Spatial conservation planning in the cloud"
        description="This platform supports decision-making for biodiversity and people on land, freshwater and ocean systems."
        url={`${process.env.NEXT_PUBLIC_VERCEL_URL || process.env.NEXT_PUBLIC_URL}${asPath}`}
        type="article"
        twitterCard="summary"
        twitterSite="@Marxan_Planning"
      />
      <main className="overflow-y-auto overflow-x-hidden">
        <Header className="absolute" size="lg" theme="transparent" />
        <UpcomingChanges />
        <Intro />
        <Support />
        <Banner />
        <Features />
        <PartnersList />
        <Footer />
      </main>
    </>
  );
};

export default Home;
