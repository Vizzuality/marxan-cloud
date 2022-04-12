import React, { useCallback, useMemo, useState } from 'react';

import { useAdminPublishedProjects } from 'hooks/admin';

import Table2 from 'components/table2';

import Name from './cells/name';
import Owner from './cells/owner';
import Status from './cells/status';

export interface AdminPublishedProjectsTableProps {

}

export const AdminPublishedProjectsTable: React.FC<AdminPublishedProjectsTableProps> = () => {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState({ id: 'name', direction: 'desc' });

  const {
    data: publishedProjectsData = [],
    meta,
    isFetching,
  } = useAdminPublishedProjects({
    page,
    sort,
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
        Header: 'Owner',
        accessor: 'owner',
        className: 'text-sm leading-none',
        disableSortBy: true,
        Cell: Owner,
        width: 100,
      },
      {
        Header: 'Status',
        accessor: 'status',
        disableSortBy: true,
        Cell: Status,
        width: 75,
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

  return (
    <Table2
      data={publishedProjectsData}
      meta={meta}
      columns={COLUMNS}
      initialState={initialState}
      loading={isFetching}
      onPageChange={onPageChange}
      onSortChange={onSortChange}
    />
  );
};

export default AdminPublishedProjectsTable;
