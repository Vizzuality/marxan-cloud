import React from 'react';
import Head from 'next/head';

import Header from 'layout/header';
import SignIn from 'layout/sign-in';

import { withoutProtection } from 'hoc/auth';

export const getServerSideProps = withoutProtection();

const SignInPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Sign in</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

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
