import React from 'react';
import Head from 'next/head';

import Header from 'layout/header';
import SignUp from 'layout/sign-up';
import Wrapper from 'layout/wrapper';

const SignUpPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Sign up</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Header size="base" />

        <Wrapper>
          <div className="flex items-center justify-center">
            <SignUp />
          </div>
        </Wrapper>
      </main>
    </>
  );
};

export default SignUpPage;
