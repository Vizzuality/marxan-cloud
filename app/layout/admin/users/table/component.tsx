import React, { useCallback, useMemo, useState } from 'react';

import { format } from 'date-fns';
import { useSession } from 'next-auth/react';
import { useDebouncedCallback } from 'use-debounce';

import { useAdminUsers } from 'hooks/admin';
import { useToasts } from 'hooks/toast';

import Button from 'components/button';
import Search from 'components/search';
import Table2 from 'components/table2';

import DOWNLOADS from 'services/downloads';

import CellAdmin from './cells/admin';
import CellBlock from './cells/block';

export interface AdminUsersTableProps {}

export const AdminUsersTable: React.FC<AdminUsersTableProps> = () => {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState({ id: 'displayName', direction: 'desc' });
  const [search, setSearch] = useState<string>();

  const { addToast } = useToasts();

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

  const initialState = useMemo(
    () => ({
      pageIndex: page - 1,
      sortBy: [
        {
          id: sort.id,
          desc: sort.direction === 'desc',
        },
      ],
    }),
    [page, sort]
  );

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

  const { data: session } = useSession();

  const onDownloadUsersData = useCallback(async () => {
    const { data: blob, status } = await DOWNLOADS.request<ArrayBuffer>({
      url: '/users/csv',
      responseType: 'arraybuffer',
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        'Content-Type': 'application/zip',
      },
    });

    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `users-${format(Date.now(), 'MM/dd/yyyy hh:mm:ss')}.csv`);

    document.body.appendChild(link);
    link.click();
    link.remove();

    if (status !== 200) {
      addToast(
        'download-error',
        <>
          <h2 className="font-medium">Error!</h2>
          <ul className="text-sm">Data not downloaded</ul>
        </>,
        {
          level: 'error',
        }
      );
    }
  }, [addToast, session]);

  return (
    <div className="space-y-5">
      <div className="flex w-full justify-between">
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
        <Button theme="secondary" size="base" type="button" onClick={onDownloadUsersData}>
          Download data
        </Button>
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
