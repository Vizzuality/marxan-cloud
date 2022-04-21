import React, { useCallback, useMemo, useState } from 'react';

import { useDebouncedCallback } from 'use-debounce';

import { useAdminPublishedProjects } from 'hooks/admin';

import Search from 'components/search';
import Table2 from 'components/table2';

import Name from './cells/name';
import Owner from './cells/owner';
import Status from './cells/status';
import Unpublish from './cells/unpublish';

export interface AdminPublishedProjectsTableProps {

}

export const AdminPublishedProjectsTable: React.FC<AdminPublishedProjectsTableProps> = () => {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState({ id: 'name', direction: 'desc' });
  const [search, setSearch] = useState<string>();

  const {
    data: publishedProjectsData = [],
    meta,
    isFetching,
  } = useAdminPublishedProjects({
    page,
    sort,
    search,
  });

  const COLUMNS = useMemo(() => {
    return [
      {
        Header: 'Name',
        accessor: 'name',
        className: 'font-bold underline leading-none',
        defaultCanSort: true,
        sortDescFirst: true,
        Cell: Name,
      },
      {
        Header: 'Description',
        accessor: 'description',
        className: 'text-sm leading-none',
        defaultCanSort: true,
        sortDescFirst: true,
      },
      {
        Header: 'Owners',
        accessor: 'owners',
        className: 'text-sm leading-none',
        disableSortBy: true,
        Cell: Owner,
        // width: 100,
      },
      {
        Header: 'Status',
        accessor: 'status',
        disableSortBy: true,
        Cell: Status,
        width: 100,
      },
      {
        Header: 'Actions',
        disableSortBy: true,
        Cell: Unpublish,
        width: 50,
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
  }), [page, sort]);// eslint-disable-line react-hooks/exhaustive-deps

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
        data={publishedProjectsData}
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

export default AdminPublishedProjectsTable;
