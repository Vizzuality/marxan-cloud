import React from 'react';

import { withProtection, withUser } from 'hoc/auth';

import Head from 'layout/head';
import Header from 'layout/header';
import Me from 'layout/me';
import MetaIcons from 'layout/meta-icons';
import Protected from 'layout/protected';

export const getServerSideProps = withProtection(withUser());

const MePage: React.FC = () => {
  return (
    <Protected>

      <Head title="Me" />

      <MetaIcons />

      <main className="flex flex-col w-screen h-screen">
        <Header size="base" />

        <div className="flex items-center justify-center text-gray-600 bg-white">
          <Me />
        </div>

      </main>
    </Protected>
  );
};

export default MePage;
