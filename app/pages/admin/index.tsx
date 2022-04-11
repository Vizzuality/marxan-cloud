import React from 'react';

import Link from 'next/link';

import { withAdmin, withProtection, withUser } from 'hoc/auth';

import Head from 'layout/head';
import Header from 'layout/header';
import MetaIcons from 'layout/meta-icons';
import Protected from 'layout/protected';
import Wrapper from 'layout/wrapper';

import Icon from 'components/icon';

import PUBLISHED_PROJECTS_SVG from 'svgs/admin/published-projects.svg?sprite';
import USERS_SVG from 'svgs/admin/users.svg?sprite';

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

            <div className="grid grid-cols-3 gap-5">
              <Link href="/admin/published-projects">
                <a href="/admin/published-projects" className="block p-8 space-y-3 leading-none bg-white hover:underline rounded-xl group">
                  <div className="flex items-center justify-center text-gray-500 transition-all bg-gray-100 w-14 h-14 rounded-2xl group-hover:bg-primary-500 group-hover:text-white">
                    <Icon icon={PUBLISHED_PROJECTS_SVG} className="w-7 h-7" />
                  </div>

                  <div className="text-xl font-medium font-heading">
                    Published Projects
                  </div>
                </a>
              </Link>
              <Link href="/admin/users">
                <a href="/admin/users" className="block p-8 space-y-3 leading-none bg-white hover:underline rounded-xl group">
                  <div className="flex items-center justify-center text-gray-500 transition-all bg-gray-100 w-14 h-14 rounded-2xl group-hover:bg-primary-500 group-hover:text-white">
                    <Icon icon={USERS_SVG} className="w-7 h-7" />
                  </div>

                  <div className="text-xl font-medium font-heading">
                    Users
                  </div>
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
