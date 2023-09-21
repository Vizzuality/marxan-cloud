import React from 'react';

import Link from 'next/link';

import { withAdmin, withProtection, withUser } from 'hoc/auth';

import Icon from 'components/icon';
import Head from 'layout/head';
import Header from 'layout/header';
import MetaIcons from 'layout/meta-icons';
import Protected from 'layout/protected';
import Wrapper from 'layout/wrapper';

import PUBLISHED_PROJECTS_SVG from 'svgs/admin/published-projects.svg?sprite';
import USERS_SVG from 'svgs/admin/users.svg?sprite';

export const getServerSideProps = withProtection(withUser(withAdmin()));

const AdminPage: React.FC = () => {
  return (
    <>
      <Head title="Admin" />
      <Protected>
        <MetaIcons />

        <main className="min-h-screen bg-gray-100 text-black">
          <Header size="base" />

          <Wrapper>
            <h2 className="my-10 font-heading text-5xl font-medium">Admin Panel</h2>

            <div className="grid grid-cols-3 gap-5">
              <Link
                href="/admin/published-projects"
                className="group block space-y-3 rounded-xl bg-white p-8 leading-none"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-200 text-gray-600 transition-all group-hover:bg-primary-500">
                  <Icon icon={PUBLISHED_PROJECTS_SVG} className="h-7 w-7" />
                </div>
                <div className="font-heading text-xl font-medium">Published Projects</div>
              </Link>
              <Link
                href="/admin/users"
                className="group block space-y-3 rounded-xl bg-white p-8 leading-none"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-200 text-gray-600 transition-all group-hover:bg-primary-500">
                  <Icon icon={USERS_SVG} className="h-7 w-7" />
                </div>
                <div className="font-heading text-xl font-medium">Users</div>
              </Link>
            </div>
          </Wrapper>
        </main>
      </Protected>
    </>
  );
};

export default AdminPage;
