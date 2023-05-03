import React from 'react';

import { withoutProtection } from 'hoc/auth';

import ForgotPassword from 'layout/forgot-password';
import Head from 'layout/head';
import Header from 'layout/header';
import MetaIcons from 'layout/meta-icons';

export const getServerSideProps = withoutProtection();

const ForgotPasswordPage: React.FC = () => {
  return (
    <>
      <Head title="Forgot password" />
      <MetaIcons />

      <main className="flex h-screen w-screen flex-col">
        <Header size="base" />

        <div className="flex h-full flex-col md:flex-grow">
          <div className="flex h-full items-center justify-center bg-white py-10">
            <ForgotPassword />
          </div>
        </div>
      </main>
    </>
  );
};

export default ForgotPasswordPage;
