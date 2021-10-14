import React from 'react';

import { withoutProtection } from 'hoc/auth';

import Head from 'layout/head';
import Header from 'layout/header';
import SignUpConfirmation from 'layout/me/sign-up-confirmation';
import MetaIcons from 'layout/meta-icons';

export const getServerSideProps = withoutProtection();

const SignUpConfirmationPage: React.FC = () => {
  return (
    <>
      <Head title="Account Confirmation" />
      <MetaIcons />

      <main className="flex flex-col w-screen h-screen">
        <Header size="base" />

        <div className="flex flex-col h-full md:flex-grow">
          <div className="flex items-center justify-center h-full py-10 bg-white">
            <SignUpConfirmation />
          </div>
        </div>
      </main>
    </>
  );
};

export default SignUpConfirmationPage;
