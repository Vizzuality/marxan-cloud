import React from 'react';

import Link from 'next/link';

import { withAdmin, withProtection, withUser } from 'hoc/auth';

import Head from 'layout/head';
import Header from 'layout/header';
import MetaIcons from 'layout/meta-icons';
import Protected from 'layout/protected';
import Wrapper from 'layout/wrapper';

export const getServerSideProps = withProtection(withUser(withAdmin()));

const AdminPage: React.FC = () => {
  return (
    <>
      <Head title="Admin" />
      <Protected>
        <MetaIcons />

        <main className="min-h-screen text-black bg-gray-50">
          <Header size="base" />

          <Wrapper>
            <h2 className="my-10 text-5xl font-medium font-heading">Admin Panel</h2>

            <div className="space-y-5">
              <Link href="/admin/published-projects">
                <a href="/admin/published-projects" className="block text-2xl font-bold leading-none text-primary-500 hover:underline">
                  Published Projects
                </a>
              </Link>
              <Link href="/admin/users">
                <a href="/admin/users" className="block text-2xl font-bold leading-none text-primary-500 hover:underline">
                  Users
                </a>
              </Link>
            </div>
          </Wrapper>
        </main>
      </Protected>
    </>
  );
};

export default AdminPage;
