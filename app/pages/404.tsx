import React from 'react';
import Head from 'next/head';

import Header from 'layout/header';

const Custom404: React.FC = () => {
  return (
    <>
      <Head>
        <title>404 - Page Not Found</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col w-screen h-screen">
        <Header size="base" />

        <div className="flex flex-col h-full md:flex-grow">
          <div className="flex items-center justify-center h-full py-10 bg-white">
            <h1 className="text-2xl text-gray-500 font-heading">404 - Page Not Found</h1>
          </div>
        </div>
      </main>
    </>
  );
};

export default Custom404;
