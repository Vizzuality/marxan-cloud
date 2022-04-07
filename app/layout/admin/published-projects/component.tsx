import React from 'react';

import AdminPublishedProjectsTable from 'layout/admin/published-projects/table/component';
import Wrapper from 'layout/wrapper';

export interface AdminPublishedProjectsProps {

}

export const AdminPublishedProjects: React.FC<AdminPublishedProjectsProps> = () => {
  return (
    <Wrapper>
      <AdminPublishedProjectsTable />
    </Wrapper>
  );
};

export default AdminPublishedProjects;
