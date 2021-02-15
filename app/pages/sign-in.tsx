import React from 'react';
import Head from 'next/head';

import Header from 'layout/header';
import SignIn from 'layout/sign-in';
import Wrapper from 'layout/wrapper';

const SignInPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Sign in</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Header size="base" />

        <Wrapper>
          <div className="flex items-center justify-center">
            <SignIn />
          </div>
        </Wrapper>
      </main>
    </>
  );
};

export default SignInPage;
