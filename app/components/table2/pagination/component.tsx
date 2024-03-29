import React, { useCallback } from 'react';

import ReactPaginate from 'react-paginate';

import Button from 'components/button';
import Icon from 'components/icon';

import ARROW_LEFT_2_SVG from 'svgs/ui/arrow-left-2.svg?sprite';
import ARROW_RIGHT_2_SVG from 'svgs/ui/arrow-right-2.svg?sprite';

export interface Table2PaginationProps {
  pageIndex: number;
  pageCount: number;
  canPreviousPage: boolean;
  canNextPage: boolean;
  gotoPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
}

export const Table2Pagination: React.FC<Table2PaginationProps> = ({
  pageIndex,
  pageCount,
  canPreviousPage,
  canNextPage,
  gotoPage,
  nextPage,
  previousPage,
}: Table2PaginationProps) => {
  const handlePageClick = useCallback(
    ({ selected }) => {
      gotoPage(selected);
    },
    [gotoPage]
  );

  if (pageCount === 0) return null;

  return (
    <div className="sticky bottom-0 rounded-b-3xl bg-white px-10 py-5">
      <div className="pointer-events-none absolute left-0 top-0 z-0 h-full w-full rotate-180 transform shadow-lg" />

      <div className="flex items-center justify-between">
        <Button
          className="space-x-2"
          size="base"
          theme="tertiary"
          disabled={!canPreviousPage}
          onClick={previousPage}
        >
          <Icon icon={ARROW_LEFT_2_SVG} className="h-3 w-3" />
          <span>Previous</span>
        </Button>

        <ReactPaginate
          containerClassName="flex items-center justify-between space-x-2"
          previousClassName="hidden"
          nextClassName="hidden"
          pageClassName="text-sm px-1.5 py-0.5 rounded-md"
          activeClassName="bg-gray-200"
          breakLabel="..."
          pageCount={pageCount}
          forcePage={pageIndex}
          pageRangeDisplayed={3}
          marginPagesDisplayed={2}
          onPageChange={handlePageClick}
        />

        <Button
          className="space-x-2"
          size="base"
          theme="tertiary"
          disabled={!canNextPage}
          onClick={nextPage}
        >
          <span>Next</span>
          <Icon icon={ARROW_RIGHT_2_SVG} className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

export default Table2Pagination;
