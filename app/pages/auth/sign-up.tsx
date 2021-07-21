import React from 'react';
import Head from 'next/head';

import { useRouter } from 'next/router';

import Header from 'layout/header';
import MetaIcons from 'layout/meta-icons';
import MetaTags from 'layout/meta-tags';

import SignUp from 'layout/sign-up';

import { withUser } from 'hoc/auth';

export const getServerSideProps = withUser();

const SignUpPage: React.FC = () => {
  const { asPath } = useRouter();

  return (
    <>
      <Head>
        <title>Sign up</title>
      </Head>

      <MetaIcons />

      <MetaTags
        name="Marxan conservation Solutions"
        title="Sign up"
        description="Get Started!"
        url={`${process.env.NEXT_PUBLIC_VERCEL_URL}${asPath}`}
        type="article"
        twitterCard="summary"
        twitterSite="@Marxan_Planning"
      />

      <main className="flex flex-col w-screen h-screen">
        <Header size="base" />

        <div className="flex flex-col h-full md:flex-grow">
          <div className="flex items-center justify-center h-full py-10 bg-white">
            <SignUp />
          </div>
        </div>
      </main>
    </>
  );
};

export default SignUpPage;
