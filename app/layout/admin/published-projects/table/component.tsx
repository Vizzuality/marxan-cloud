import React, { useCallback, useMemo, useState } from 'react';

import { useAdminPublishedProjects } from 'hooks/admin';

import Table2 from 'components/table2/component';

export interface AdminPublishedProjectsTableProps {

}

export const AdminPublishedProjectsTable: React.FC<AdminPublishedProjectsTableProps> = () => {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState({ column: 'title', direction: 'asc' });

  const {
    data: publishedProjectsData,
    meta,
  } = useAdminPublishedProjects({
    page,
    sort,
  });

  const COLUMNS = useMemo(() => {
    return [
      {
        Header: 'Name',
        accessor: 'name',
        defaultCanSort: true,
      },
      {
        Header: 'Planning Area',
        accessor: 'area',
        defaultCanSort: true,
      },
      {
        Header: 'Owner',
        accessor: 'owners',
        defaultCanSort: true,
      },
      {
        Header: 'Status',
        accessor: 'underModeration',
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
      data={publishedProjectsData}
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

export default AdminPublishedProjectsTable;
