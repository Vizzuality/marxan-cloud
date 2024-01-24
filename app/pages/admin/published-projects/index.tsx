import React from 'react';

import { withAdmin, withProtection, withUser } from 'hoc/auth';

import AdminPublishedProjects from 'layout/admin/published-projects';
import Head from 'layout/head';
import Header from 'layout/header';
import MetaIcons from 'layout/meta-icons';
import Protected from 'layout/protected';

export const getServerSideProps = withProtection(withUser(withAdmin()));

const AdminPublishedProjectsPage: React.FC = () => {
  return (
    <>
      <Head title="Admin - Published Projects" />
      <Protected>
        <MetaIcons />

        <main className="min-h-screen bg-gray-100 text-black">
          <Header size="base" />

          <AdminPublishedProjects />
        </main>
      </Protected>
    </>
  );
};

export default AdminPublishedProjectsPage;
