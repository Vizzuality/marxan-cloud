import React from 'react';
import Head from 'next/head';

import { useRouter } from 'next/router';

import Header from 'layout/header';
import MetaTags from 'layout/meta-tags';
import SignUp from 'layout/sign-up';

import MARXAN_SOCIAL_MEDIA_IMG from 'images/social-media/marxan-social-media.png';

import { withUser } from 'hoc/auth';

export const getServerSideProps = withUser();

const SignUpPage: React.FC = () => {
  const { asPath } = useRouter();

  return (
    <>
      <Head>
        <title>Sign up</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <MetaTags
        name="Marxan conservation Solutions"
        title="Sign up"
        description="Get Started!"
        url={`${process.env.NEXT_PUBLIC_VERCEL_URL}${asPath}`}
        image={MARXAN_SOCIAL_MEDIA_IMG}
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
