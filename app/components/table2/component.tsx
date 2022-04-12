import React, { useEffect } from 'react';

import {
  useTable,
  useFlexLayout,
  usePagination,
  useSortBy,
} from 'react-table';

import cx from 'classnames';

import Icon from 'components/icon';
import Loading from 'components/loading';

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

  const { sortBy } = state;
  const [sortSelected] = sortBy;

  return (
    <div className="relative w-full">
      <div {...getTableProps()} className="relative w-full mb-2 bg-white rounded-t-3xl">
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
                className="sticky top-0 z-10 px-10"
              >
                {headerGroup.headers.map((column) => {
                  const {
                    id, canSort, sortDescFirst, toggleSortBy,
                  } = column;

                  const {
                    key: headerKey,
                    ...restHeaderProps
                  } = column.getHeaderProps();

                  return (
                    <div
                      role="presentation"
                      key={headerKey}
                      {...restHeaderProps}
                      className={cx({
                        'flex items-center py-5 space-x-2 text-xs font-medium uppercase font-heading': true,
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
                          className={cx({
                            'w-3 h-3': true,
                            'transform rotate-180': !sortSelected.desc,
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
        <div className="relative tbody">
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
                className="px-10 border-t border-gray-100"
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
                      className={cx({
                        'py-5': true,
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
            <div className="absolute bottom-0 left-0 flex items-center justify-center w-full h-full">
              <Loading
                className="flex items-center justify-center w-full h-full bg-white bg-opacity-50"
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
