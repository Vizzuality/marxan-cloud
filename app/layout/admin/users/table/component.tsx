import React, { useCallback, useMemo, useState } from 'react';

import { useDebouncedCallback } from 'use-debounce';

import { useAdminUsers } from 'hooks/admin';

import Search from 'components/search';
import Table2 from 'components/table2';

import CellAdmin from './cells/admin';
import CellBlock from './cells/block';

export interface AdminUsersTableProps {

}

export const AdminUsersTable: React.FC<AdminUsersTableProps> = () => {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState({ id: 'displayName', direction: 'desc' });
  const [search, setSearch] = useState<string>();

  const {
    data: adminUsersData = [],
    meta,
    isFetching,
  } = useAdminUsers({
    page,
    sort,
    search,
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

  const onSearch = useDebouncedCallback((v) => {
    setSearch(v);
  }, 250);

  return (
    <div className="space-y-5">
      <div className="max-w-lg">
        <Search
          id="published-project-search"
          defaultValue={search}
          size="base"
          theme="light"
          placeholder="Search by project name, planning area name..."
          aria-label="Search"
          onChange={onSearch}
        />
      </div>

      <Table2
        data={adminUsersData}
        meta={meta}
        columns={COLUMNS}
        initialState={initialState}
        loading={isFetching}
        onPageChange={onPageChange}
        onSortChange={onSortChange}
      />
    </div>
  );
};

export default AdminUsersTable;
