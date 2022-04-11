import React from 'react';

import AdminHeader from 'layout/admin/header';

export interface AdminPublishedProjectsHeaderProps {

}

export const AdminPublishedProjectsHeader: React.FC<AdminPublishedProjectsHeaderProps> = () => {
  return (
    <AdminHeader title="Published Projects" />
  );
};

export default AdminPublishedProjectsHeader;
