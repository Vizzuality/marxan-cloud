import React, { useEffect } from 'react';

import { useTable, useFlexLayout, usePagination, useSortBy } from 'react-table';

import Icon from 'components/icon';
import Loading from 'components/loading';
import { cn } from 'utils/cn';

import ARROW_DOWN_SVG from 'svgs/ui/arrow-down.svg?sprite';

import Pagination from './pagination';

export interface Table2Props {
  data: Record<string, any>[];
  meta: Record<string, any>;
  columns: Record<string, any>[];
  initialState?: Record<string, any>;
  loading?: boolean;
  onPageChange?: (page: number) => void;
  onSortChange?: (column: string, direction: string) => void;
}

export const Table2: React.FC<Table2Props> = ({
  data,
  meta,
  columns,
  initialState,
  loading,
  onPageChange,
  onSortChange,
}: Table2Props) => {
  const DEFAULT_COLUMN = React.useMemo(
    () => ({
      // When using the useFlexLayout:
      minWidth: 30, // minWidth is only used as a limit for resizing
      width: 150, // width is used for both the flex-basis and flex-grow
      maxWidth: 200, // maxWidth is only used as a limit for resizing
    }),
    []
  );

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
      pageCount: meta?.totalPages || 0,

      // sorting
      manualSortBy: true,
      disableMultiSort: true,

      initialState: {
        ...initialState,
        pageIndex: meta?.page ? meta.page - 1 : 0,
        pageSize: meta?.size || 10,
      },
    },
    useFlexLayout,
    useSortBy,
    usePagination
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

  const { sortBy } = state;
  const [sortSelected] = sortBy;

  return (
    <div className="relative -mx-10">
      <div {...getTableProps()} className="relative mb-2 w-full rounded-t-3xl bg-white">
        <div>
          {headerGroups.map((headerGroup) => {
            const { key: headerGroupKey, ...restHeaderGroupProps } =
              headerGroup.getHeaderGroupProps();

            return (
              <div
                key={headerGroupKey}
                {...restHeaderGroupProps}
                className="sticky top-0 z-10 px-10"
              >
                {headerGroup.headers.map((column) => {
                  const { id, canSort, sortDescFirst, toggleSortBy } = column;

                  const { key: headerKey, ...restHeaderProps } = column.getHeaderProps();

                  return (
                    <div
                      role="presentation"
                      key={headerKey}
                      {...restHeaderProps}
                      className={cn({
                        'flex items-center space-x-2 py-5 pr-5 font-heading text-xs font-medium uppercase':
                          true,
                        'cursor-pointer': canSort,
                      })}
                      {...(canSort && {
                        onClick: () => {
                          if (id === sortSelected?.id) {
                            toggleSortBy(!sortSelected.desc, false);
                          }

                          if (id !== sortSelected?.id) {
                            toggleSortBy(sortDescFirst, false);
                          }
                        },
                      })}
                    >
                      <span>{column.render('Header')}</span>
                      {sortSelected && sortSelected.id === column.id && (
                        <Icon
                          icon={ARROW_DOWN_SVG}
                          className={cn({
                            'h-3 w-3': true,
                            'rotate-180 transform': !sortSelected.desc,
                          })}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
        <div className="tbody relative" style={{ minHeight: 50 }}>
          {rows.map((row) => {
            prepareRow(row);

            const { key: rowKey, ...restRowProps } = row.getRowProps();

            return (
              <div key={rowKey} {...restRowProps} className="border-t border-gray-200 px-10">
                {row.cells.map((cell) => {
                  const { key: cellKey, ...restCellProps } = cell.getCellProps();

                  return (
                    <div
                      key={cellKey}
                      {...restCellProps}
                      className={cn({
                        'py-5 pr-5': true,
                        [cell?.column?.className]: !!cell?.column?.className,
                      })}
                    >
                      {cell.render('Cell')}
                    </div>
                  );
                })}
              </div>
            );
          })}

          {loading && (
            <div className="absolute bottom-0 left-0 flex h-full w-full items-center justify-center">
              <Loading
                className="flex h-full w-full items-center justify-center bg-white bg-opacity-50"
                iconClassName="w-10 h-10"
                visible
              />
            </div>
          )}
        </div>
      </div>

      <Pagination
        pageIndex={state.pageIndex}
        canPreviousPage={canPreviousPage}
        canNextPage={canNextPage}
        pageCount={pageCount}
        gotoPage={gotoPage}
        nextPage={nextPage}
        previousPage={previousPage}
      />
    </div>
  );
};

export default Table2;
