import React from 'react';
import Head from 'next/head';

import Header from 'layout/header';
import Protected from 'layout/protected';

import Me from 'layout/me';

const MePage: React.FC = () => {
  return (
    <Protected>
      <Head>
        <title>Me</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col w-screen h-screen">
        <Header size="base" />

        <div className="md:flex-grow">
          <div className="flex items-center justify-center h-full py-10 text-gray-600 bg-white">
            <Me />
          </div>
        </div>
      </main>
    </Protected>
  );
};

export default MePage;
