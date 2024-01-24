import React from 'react';

import { useRouter } from 'next/router';

import { withUser } from 'hoc/auth';

import Head from 'layout/head';
import Header from 'layout/header';
import MetaIcons from 'layout/meta-icons';
import MetaTags from 'layout/meta-tags';
import SignUp from 'layout/sign-up';

export const getServerSideProps = withUser();

const SignUpPage: React.FC = () => {
  const { asPath } = useRouter();

  return (
    <>
      <Head title="Sign up" />

      <MetaIcons />

      <MetaTags
        name="Marxan conservation Solutions"
        title="Sign up"
        description="Get Started!"
        url={`${process.env.NEXT_PUBLIC_VERCEL_URL || process.env.NEXT_PUBLIC_URL}${asPath}`}
        type="article"
        twitterCard="summary"
        twitterSite="@Marxan_Planning"
      />

      <main className="flex h-screen w-screen flex-col">
        <Header size="base" />

        <div className="flex flex-col md:flex-grow">
          <div className="flex h-full items-center justify-center bg-white py-10">
            <SignUp />
          </div>
        </div>
      </main>
    </>
  );
};

export default SignUpPage;
