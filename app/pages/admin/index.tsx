import React from 'react';

import { withAdmin, withProtection, withUser } from 'hoc/auth';

import Header from 'layout/header';
import MetaIcons from 'layout/meta-icons';
import Protected from 'layout/protected';

export const getServerSideProps = withProtection(withUser(withAdmin()));

const AdminPage: React.FC = () => {
  return (
    <Protected>
      <MetaIcons />

      <main>
        <Header size="base" />

        Admin
      </main>
    </Protected>
  );
};

export default AdminPage;
