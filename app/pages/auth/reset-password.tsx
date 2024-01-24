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

      <main className="flex h-screen w-screen flex-col">
        <Header size="base" />

        <div className="flex h-full flex-col md:flex-grow">
          <div className="flex h-full items-center justify-center bg-white py-10">
            <ResetPassword />
          </div>
        </div>
      </main>
    </>
  );
};

export default ResetPasswordPage;
