import React from 'react';
import Head from 'next/head';

import { useRouter } from 'next/router';

import Header from 'layout/header';
import Footer from 'layout/footer';
import MetaTags from 'layout/meta-tags';

import Contact from 'layout/statics/contact';
import PrivacyPolicyTerms from 'layout/statics/privacy-policy';

import MARXAN_SOCIAL_MEDIA_IMG from 'images/social-media/marxan-social-media.png';

import { withUser } from 'hoc/auth';

export const getServerSideProps = withUser();

const PrivacyPolicy: React.FC = () => {
  const { asPath } = useRouter();

  return (
    <>
      <Head>
        <title>Privacy Police</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <MetaTags
        name="Marxan conservation Solutions"
        title="privacy Police"
        description=""
        url={`${process.env.NEXT_PUBLIC_VERCEL_URL}${asPath}`}
        image={MARXAN_SOCIAL_MEDIA_IMG}
        type="article"
        twitterCard="summary"
        twitterSite="@Marxan_Planning"
      />

      <main className="flex flex-col h-full md:flex-grow">
        <Header size="base" />
        <PrivacyPolicyTerms />
        <Contact />
        <Footer />
      </main>
    </>
  );
};

export default PrivacyPolicy;
