import React from 'react';

import { useRouter } from 'next/router';

import { withUser } from 'hoc/auth';

import Footer from 'layout/footer';
import Head from 'layout/head';
import Header from 'layout/header';
import MetaIcons from 'layout/meta-icons';
import MetaTags from 'layout/meta-tags';
import Contact from 'layout/statics/contact';
import PrivacyPolicyTerms from 'layout/statics/privacy-policy';

export const getServerSideProps = withUser();

const TermsOfUse: React.FC = () => {
  const { asPath } = useRouter();

  return (
    <>
      <Head title="Terms of Use" />

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
