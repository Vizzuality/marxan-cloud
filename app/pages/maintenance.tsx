import React from 'react';

import { useRouter } from 'next/router';

import Head from 'layout/head';
import Header from 'layout/header';
import Intro from 'layout/maintenance/intro';
import MetaIcons from 'layout/meta-icons';
import MetaTags from 'layout/meta-tags';

const Maintenance: React.FC = () => {
  const { asPath } = useRouter();

  return (
    <>
      <Head title="Maintenance" />

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
      <main
        className="overflow-x-hidden overflow-y-auto"
      >
        <Header className="absolute" size="lg" theme="transparent" maintenance />
        <Intro />
      </main>
    </>
  );
};

export default Maintenance;
