import React from 'react';

import { withAdmin, withProtection, withUser } from 'hoc/auth';

import AdminUsers from 'layout/admin/users';
import Head from 'layout/head';
import Header from 'layout/header';
import MetaIcons from 'layout/meta-icons';
import Protected from 'layout/protected';

export const getServerSideProps = withProtection(withUser(withAdmin()));

const AdminUsersPage: React.FC = () => {
  return (
    <>
      <Head title="Admin - Users" />
      <Protected>
        <MetaIcons />

        <main className="min-h-screen text-black bg-gray-50">
          <Header size="base" />

          <AdminUsers />
        </main>
      </Protected>
    </>
  );
};

export default AdminUsersPage;
