import React from 'react';

export interface Table2PaginationProps {
  pageIndex: number;
  canPreviousPage: boolean;
  canNextPage: boolean;
  pageOptions: number[];
  pageCount: number;
  gotoPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
}

export const Table2Pagination: React.FC<Table2PaginationProps> = ({
  pageIndex,
  canPreviousPage,
  canNextPage,
  pageOptions,
  pageCount,
  gotoPage,
  nextPage,
  previousPage,
}: Table2PaginationProps) => {
  // console.log({
  //   pageIndex,
  //   pageSize,
  //   canPreviousPage,
  //   canNextPage,
  //   pageOptions,
  //   pageCount,
  //   gotoPage,
  //   nextPage,
  //   previousPage,
  //   setPageSize,
  // });
  return (
    <div className="pagination">
      <button type="button" onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
        {'<<'}
      </button>
      {' '}
      <button type="button" onClick={() => previousPage()} disabled={!canPreviousPage}>
        {'<'}
      </button>
      {' '}
      <button type="button" onClick={() => nextPage()} disabled={!canNextPage}>
        {'>'}
      </button>
      {' '}
      <button type="button" onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
        {'>>'}
      </button>
      {' '}
      <span>
        Page
        {' '}
        <strong>
          {pageIndex + 1}
          {' '}
          of
          {' '}
          {pageOptions.length}
        </strong>
        {' '}
      </span>
      <span>
        | Go to page:
        {' '}
        <input
          type="number"
          defaultValue={pageIndex + 1}
          onChange={(e) => {
            const page = e.target.value ? Number(e.target.value) - 1 : 0;
            gotoPage(page);
          }}
          style={{ width: '100px' }}
        />
      </span>
    </div>
  );
};

export default Table2Pagination;
