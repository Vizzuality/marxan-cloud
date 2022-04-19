import React from 'react';

import AdminPublishedProjectsHeader from 'layout/admin/published-projects/header';
import AdminPublishedProjectsTable from 'layout/admin/published-projects/table';
import Wrapper from 'layout/wrapper';

export interface AdminPublishedProjectsProps {

}

export const AdminPublishedProjects: React.FC<AdminPublishedProjectsProps> = () => {
  return (
    <Wrapper>
      <AdminPublishedProjectsHeader />
      <AdminPublishedProjectsTable />
    </Wrapper>
  );
};

export default AdminPublishedProjects;
