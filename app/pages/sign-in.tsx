import React from 'react';
import Head from 'next/head';

import Header from 'layout/header';
import SignIn from 'layout/sign-in';

const SignInPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Sign in</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col w-screen h-screen">
        <Header size="base" />

        <div className="md:flex-grow">
          <div className="flex items-center justify-center h-full py-10">
            <SignIn />
          </div>
        </div>
      </main>
    </>
  );
};

export default SignInPage;
