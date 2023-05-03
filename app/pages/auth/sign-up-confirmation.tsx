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

      <main className="flex h-screen w-screen flex-col">
        <Header size="base" />

        <div className="flex h-full flex-col md:flex-grow">
          <div className="flex h-full items-center justify-center bg-white py-10">
            <SignUpConfirmation />
          </div>
        </div>
      </main>
    </>
  );
};

export default SignUpConfirmationPage;
