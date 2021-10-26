import React from 'react';

import { withoutProtection } from 'hoc/auth';

import Head from 'layout/head';
import Header from 'layout/header';
import ResetPasswordConfirmation from 'layout/me/reset-password-confirmation';
import MetaIcons from 'layout/meta-icons';

export const getServerSideProps = withoutProtection();

const RecoverPasswordConfirmationPage: React.FC = () => {
  return (
    <>
      <Head title="Recover Password Confirmation" />
      <MetaIcons />

      <main className="flex flex-col w-screen h-screen">
        <Header size="base" />

        <div className="flex flex-col h-full md:flex-grow">
          <div className="flex items-center justify-center h-full py-10 bg-white">
            <ResetPasswordConfirmation />
          </div>
        </div>
      </main>
    </>
  );
};

export default RecoverPasswordConfirmationPage;
