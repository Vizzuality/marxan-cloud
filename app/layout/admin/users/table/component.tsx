import React, { useCallback, useMemo, useState } from 'react';

import { useAdminUsers } from 'hooks/admin';

import Table2 from 'components/table2/component';

export interface AdminUsersTableProps {

}

export const AdminUsersTable: React.FC<AdminUsersTableProps> = () => {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState({ column: 'displayName', direction: 'desc' });

  const {
    data: adminUsersData = [],
    meta,
  } = useAdminUsers({
    page,
    sort,
  });

  const COLUMNS = useMemo(() => {
    return [
      {
        Header: 'Name',
        accessor: 'displayName',
        className: 'font-bold underline leading-none',
        defaultCanSort: true,
      },
      {
        Header: 'Email',
        accessor: 'email',
        className: 'text-sm leading-none',
        defaultCanSort: true,
      },
    ];
  }, []);

  const onPageChange = useCallback((p) => {
    setPage(p);
  }, []);

  const onSortChange = useCallback((column, direction) => {
    setSort({
      column,
      direction,
    });
  }, []);

  return (
    <Table2
      data={adminUsersData}
      meta={meta}
      columns={COLUMNS}
      initialState={{
        pageIndex: page - 1,
      }}
      onPageChange={onPageChange}
      onSortChange={onSortChange}
    />
  );
};

export default AdminUsersTable;
