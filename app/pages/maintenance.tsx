import React from 'react';

import Head from 'next/head';
import { useRouter } from 'next/router';

import HeadLayout from 'layout/head';
import Header from 'layout/header';
import Intro from 'layout/maintenance/intro';
import MetaTags from 'layout/meta-tags';

const Maintenance: React.FC = () => {
  const { asPath } = useRouter();

  return (
    <>
      <HeadLayout title="Maintenance" />

      <Head>
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      </Head>

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
        <Header className="absolute" size="lg" theme="transparent" maintenance />
        <Intro />
      </main>
    </>
  );
};

export default Maintenance;
