import React, { useCallback, useMemo, useState } from 'react';

import { useAdminPublishedProjects } from 'hooks/admin';

import Table2 from 'components/table2/component';

export interface AdminPublishedProjectsTableProps {

}

export const AdminPublishedProjectsTable: React.FC<AdminPublishedProjectsTableProps> = () => {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState({ column: 'name', direction: 'asc' });

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
        className: 'font-bold underline leading-none',
        defaultCanSort: true,
      },
      {
        Header: 'Planning Area',
        accessor: 'area',
        className: 'text-sm leading-none',
        defaultCanSort: true,
      },
      {
        Header: 'Owner',
        accessor: 'owner',
        className: 'text-sm leading-none',
        defaultCanSort: true,
        Cell: function Owner({ value }: any) {
          if (!value) return null;
          const { name, email } = value;
          return (
            <div className="space-y-1">
              <div className="font-semibold">{name}</div>
              <div>
                <a
                  className="underline text-primary-500"
                  href={`mailto:${email}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {email}
                </a>
              </div>
            </div>

          );
        },
      },
      {
        Header: 'Status',
        accessor: 'status',
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
