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

      <main className="flex flex-col w-screen h-screen">
        <Header size="base" />

        <div className="flex flex-col h-full md:flex-grow">
          <div className="flex items-center justify-center h-full py-10 bg-white">
            <ForgotPassword />
          </div>
        </div>
      </main>
    </>
  );
};

export default ForgotPasswordPage;
