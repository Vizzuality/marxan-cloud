import React from 'react';
import Head from 'next/head';

import { useRouter } from 'next/router';

import Header from 'layout/header';
import Footer from 'layout/footer';
import MetaIcons from 'layout/meta-icons';
import MetaTags from 'layout/meta-tags';

import Contact from 'layout/statics/contact';
import PrivacyPolicyTerms from 'layout/statics/privacy-policy';

import { withUser } from 'hoc/auth';

export const getServerSideProps = withUser();

const TermsOfUse: React.FC = () => {
  const { asPath } = useRouter();

  return (
    <>
      <Head>
        <title>Terms of Use</title>
      </Head>

      <MetaIcons />

      <MetaTags
        name="Marxan conservation Solutions"
        title="Terms of use"
        description=""
        url={`${process.env.NEXT_PUBLIC_VERCEL_URL}${asPath}`}
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

export default TermsOfUse;
