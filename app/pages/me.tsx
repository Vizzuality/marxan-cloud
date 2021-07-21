import React from 'react';
import Head from 'next/head';

import Header from 'layout/header';
import MetaIcons from 'layout/meta-icons';
import Protected from 'layout/protected';

import Me from 'layout/me';

import { withProtection, withUser } from 'hoc/auth';

export const getServerSideProps = withProtection(withUser());

const MePage: React.FC = () => {
  return (
    <Protected>
      <Head>
        <title>Me</title>
      </Head>

      <MetaIcons />

      <main className="flex flex-col w-screen h-screen">
        <Header size="base" />

        <div className="md:flex-grow">
          <div className="flex items-center justify-center h-full text-gray-600 bg-white">
            <Me />
          </div>
        </div>
      </main>
    </Protected>
  );
};

export default MePage;
