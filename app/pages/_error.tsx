import React from 'react';

import Head from 'layout/head';
import Header from 'layout/header';
import MetaIcons from 'layout/meta-icons';

const ErrorPage: React.FC = () => {
  return (
    <>
      <Head title="500 - Server-side error occurred" />

      <MetaIcons />

      <main className="flex flex-col w-screen h-screen">
        <Header size="base" />

        <div className="flex flex-col h-full md:flex-grow">
          <div className="flex items-center justify-center h-full py-10 bg-white">
            <h1 className="text-2xl text-gray-500 font-heading">
              500 - Server-side error occurred
            </h1>
          </div>
        </div>
      </main>
    </>
  );
};

export default ErrorPage;
