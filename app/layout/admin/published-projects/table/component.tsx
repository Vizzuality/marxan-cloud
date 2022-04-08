import React, { useCallback, useMemo, useState } from 'react';

import Link from 'next/link';

import { useAdminPublishedProjects } from 'hooks/admin';

import Select from 'components/forms/select';
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
        Cell: function Name({ value, row }: any) {
          if (!value) return null;

          const { id } = row.original;
          return (
            <Link href={`/projects/${id}`}>
              <a href={`/projects/${id}`} className="font-bold leading-none underline">
                {value}
              </a>
            </Link>
          );
        },
      },
      {
        Header: 'Description',
        accessor: 'description',
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
        defaultCanSort: true,
        Cell: function Status({ value }: any) {
          if (!value) return null;

          return (
            <Select
              theme="light"
              size="s"
              initialSelected={value}
              options={[
                { label: 'Under moderation', value: 'under-moderation' },
                { label: 'Published', value: 'published' },
              ]}
              onChange={(v: string) => {
                console.info(v);
              }}
            />
          );
        },
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
