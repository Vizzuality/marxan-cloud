import React, { useCallback, useMemo, useState } from 'react';

import { useAdminUsers } from 'hooks/admin';

import Table2 from 'components/table2';

import CellAdmin from './cells/admin';
import CellBlock from './cells/block';

export interface AdminUsersTableProps {

}

export const AdminUsersTable: React.FC<AdminUsersTableProps> = () => {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState({ id: 'displayName', direction: 'desc' });

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
        sortDescFirst: true,
      },
      {
        Header: 'Email',
        accessor: 'email',
        className: 'text-sm leading-none',
        defaultCanSort: true,
        sortDescFirst: true,
      },
      {
        Header: 'Blocked',
        accessor: 'isBlocked',
        disableSortBy: true,
        Cell: CellBlock,
        width: 0,
      },
      {
        Header: 'Admin',
        accessor: 'isAdmin',
        disableSortBy: true,
        Cell: CellAdmin,
        width: 0,
      },
    ];
  }, []);

  const initialState = useMemo(() => ({
    pageIndex: page - 1,
    sortBy: [
      {
        id: sort.id,
        desc: sort.direction === 'desc',
      },
    ],
  }), [page, sort]);

  const onPageChange = useCallback((p) => {
    setPage(p);
  }, []);

  const onSortChange = useCallback((id, direction) => {
    setSort({
      id,
      direction,
    });
  }, []);

  return (
    <>
      <Table2
        data={adminUsersData}
        meta={meta}
        columns={COLUMNS}
        initialState={initialState}
        onPageChange={onPageChange}
        onSortChange={onSortChange}
      />
    </>
  );
};

export default AdminUsersTable;
