import React from 'react';

export interface AdminPublishedProjectsHeaderProps {

}

export const AdminPublishedProjectsHeader: React.FC<AdminPublishedProjectsHeaderProps> = () => {
  return (
    <div>
      <h2 className="my-10 text-5xl font-medium font-heading">Published Projects</h2>
    </div>
  );
};

export default AdminPublishedProjectsHeader;
