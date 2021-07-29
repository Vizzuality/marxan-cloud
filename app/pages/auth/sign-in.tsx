import React from 'react';

import Head from 'next/head';
import { useRouter } from 'next/router';

import { withoutProtection } from 'hoc/auth';

import Header from 'layout/header';
import MetaIcons from 'layout/meta-icons';
import MetaTags from 'layout/meta-tags';
import SignIn from 'layout/sign-in';

export const getServerSideProps = withoutProtection();

const SignInPage: React.FC = () => {
  const { asPath } = useRouter();

  return (
    <>
      <Head>
        <title>Sign in</title>
      </Head>

      <MetaIcons />

      <MetaTags
        name="Marxan conservation Solutions"
        title="Sign in"
        description="Get in Marxan!"
        url={`${process.env.NEXT_PUBLIC_VERCEL_URL}${asPath}`}
        type="article"
        twitterCard="summary"
        twitterSite="@Marxan_Planning"
      />

      <main className="flex flex-col w-screen h-screen">
        <Header size="base" />

        <div className="flex flex-col h-full md:flex-grow">
          <div className="flex items-center justify-center h-full py-10 bg-white">
            <SignIn />
          </div>
        </div>
      </main>
    </>
  );
};

export default SignInPage;
