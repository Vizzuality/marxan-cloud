import React from 'react';

export interface AdminUsersHeaderProps {

}

export const AdminUsersHeader: React.FC<AdminUsersHeaderProps> = () => {
  return (
    <div>
      <h2 className="my-10 text-5xl font-medium font-heading">Users</h2>
    </div>
  );
};

export default AdminUsersHeader;
