import React from 'react';

import AdminUsersHeader from 'layout/admin/users/header';
import AdminUsersTable from 'layout/admin/users/table';
import Wrapper from 'layout/wrapper';

export interface AdminUsersProps {

}

export const AdminUsers: React.FC<AdminUsersProps> = () => {
  return (
    <Wrapper>
      <AdminUsersHeader />
      <AdminUsersTable />
    </Wrapper>
  );
};

export default AdminUsers;
