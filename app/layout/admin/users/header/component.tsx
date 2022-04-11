import React from 'react';

import AdminHeader from 'layout/admin/header';

export interface AdminUsersHeaderProps {

}

export const AdminUsersHeader: React.FC<AdminUsersHeaderProps> = () => {
  return (
    <AdminHeader title="Users" />
  );
};

export default AdminUsersHeader;
