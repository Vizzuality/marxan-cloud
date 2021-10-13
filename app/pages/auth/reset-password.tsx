import React from 'react';

import { withoutProtection } from 'hoc/auth';

import Head from 'layout/head';
import Header from 'layout/header';
import ResetPassword from 'layout/me/reset-password';
import MetaIcons from 'layout/meta-icons';

export const getServerSideProps = withoutProtection();

const ResetPasswordPage: React.FC = () => {
  return (
    <>
      <Head title="Forgot password" />
      <MetaIcons />

      <main className="flex flex-col w-screen h-screen">
        <Header size="base" />

        <div className="flex flex-col h-full md:flex-grow">
          <div className="flex items-center justify-center h-full py-10 bg-white">
            <ResetPassword />
          </div>
        </div>
      </main>
    </>
  );
};

export default ResetPasswordPage;
