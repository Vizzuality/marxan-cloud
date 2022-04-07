import React, { useEffect } from 'react';

import {
  useTable,
  useFlexLayout,
  usePagination,
  useSortBy,
} from 'react-table';

import Pagination from './pagination';

export interface Table2Props {
  data: Record<string, any>[];
  meta: Record<string, any>;
  columns: Record<string, any>[];
  initialState?: Record<string, any>;
  onPageChange?: (page: number) => void;
  onSortChange?: (column: string, direction: string) => void;
}

export const Table2: React.FC<Table2Props> = ({
  data,
  meta,
  columns,
  initialState,
  onPageChange,
  onSortChange,
}: Table2Props) => {
  const DEFAULT_COLUMN = React.useMemo(() => ({
    // When using the useFlexLayout:
    minWidth: 30, // minWidth is only used as a limit for resizing
    width: 150, // width is used for both the flex-basis and flex-grow
    maxWidth: 200, // maxWidth is only used as a limit for resizing
  }), []);

  const {
    getTableProps,

    // headers
    headerGroups,

    // rows
    rows,
    prepareRow,

    // pagination
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,

    // state
    state,
  } = useTable(
    {
      columns,
      defaultColumn: DEFAULT_COLUMN,
      data,
      // paginaion
      manualPagination: true,
      pageCount: meta.totalPages,

      // sorting
      manualSortBy: true,
      disableMultiSort: true,

      initialState: {
        ...initialState,
        pageIndex: meta.page - 1,
        pageSize: meta.size,
      },
    },
    useFlexLayout,
    useSortBy,
    usePagination,
  );

  useEffect(() => {
    const { pageIndex, sortBy } = state;

    const [sortSelected] = sortBy;

    if (onPageChange) {
      onPageChange(pageIndex + 1);
    }

    if (onSortChange && sortSelected) {
      const { id, desc } = sortSelected;
      onSortChange(id, desc ? 'desc' : 'asc');
    }
  }, [state, onPageChange, onSortChange]);

  return (
    <div className="w-full">

      <div {...getTableProps()} className="w-full">
        <div>
          {headerGroups.map((headerGroup) => {
            const {
              key: headerGroupKey,
              ...restHeaderGroupProps
            } = headerGroup.getHeaderGroupProps();

            return (
              <div
                key={headerGroupKey}
                {...restHeaderGroupProps}
                className="tr"
              >
                {headerGroup.headers.map((column) => {
                  const { isSorted, toggleSortBy } = column;

                  const {
                    key: headerKey,
                    ...restHeaderProps
                  } = column.getHeaderProps();

                  return (
                    <div
                      role="presentation"
                      key={headerKey}
                      {...restHeaderProps}
                      className="th"
                      onClick={() => {
                        toggleSortBy(!isSorted, false);
                      }}
                    >
                      {column.render('Header')}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
        <div className="tbody">
          {rows.map((row) => {
            prepareRow(row);

            const {
              key: rowKey,
              ...restRowProps
            } = row.getRowProps();

            return (
              <div
                key={rowKey}
                {...restRowProps}
                className="tr"
              >
                {row.cells.map((cell) => {
                  const {
                    key: cellKey,
                    ...restCellProps
                  } = cell.getCellProps();

                  return (
                    <div
                      key={cellKey}
                      {...restCellProps}
                      className="td"
                    >
                      {cell.render('Cell')}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      <Pagination
        pageIndex={state.pageIndex}
        canPreviousPage={canPreviousPage}
        canNextPage={canNextPage}
        pageOptions={pageOptions}
        pageCount={pageCount}
        gotoPage={gotoPage}
        nextPage={nextPage}
        previousPage={previousPage}
      />
    </div>
  );
};

export default Table2;
