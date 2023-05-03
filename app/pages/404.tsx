import React from 'react';

import Head from 'layout/head';
import Header from 'layout/header';
import MetaIcons from 'layout/meta-icons';

const Custom404: React.FC = () => {
  return (
    <>
      <Head title="404 - Page Not Found" />

      <MetaIcons />

      <main className="flex h-screen w-screen flex-col">
        <Header size="base" />

        <div className="flex h-full flex-col md:flex-grow">
          <div className="flex h-full items-center justify-center bg-white py-10">
            <h1 className="font-heading text-2xl text-gray-500">404 - Page Not Found</h1>
          </div>
        </div>
      </main>
    </>
  );
};

export default Custom404;
