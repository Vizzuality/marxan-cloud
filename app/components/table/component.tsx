import React, { useState } from 'react';
import cx from 'classnames';
import Icon from 'components/icon';

import ARROW_DOWN_SVG from 'svgs/ui/arrow-down.svg?sprite';
import ARROW_UP_SVG from 'svgs/ui/arrow-up.svg?sprite';

import {
  TableHeaderItem, TableProps, HeaderSelection, Direction, TableRow,
} from './types';

const DEFAULT_SORT_DIRECTION: Direction = Direction.DESC;

export const Table: React.FC<TableProps> = ({
  className,
  headers,
  body,
  selectedRowId,
}: TableProps) => {
  const [headerSelected, setHeaderSelected] = useState<HeaderSelection>(null);
  const [sortedBody, setSortedBody] = useState<TableRow[]>(body);

  const sort = (selection: HeaderSelection) => {
    const { order, id } = selection;
    const newBody = sortedBody.sort(
      (a: any, b: any) => (order === Direction.DESC ? a[id] - b[id] : b[id] - a[id]),
    );
    setSortedBody(newBody);
  };

  const handleHeaderClick = (header: TableHeaderItem) => {
    if (headerSelected && headerSelected.id === header.id) {
      const newHeaderSelected = {
        id: header.id,
        order: headerSelected.order === Direction.ASC ? Direction.DESC : Direction.ASC,
        customSort: header.customSort,
      };
      setHeaderSelected(newHeaderSelected);
      sort(newHeaderSelected);
    } else {
      const newHeaderSelected = {
        id: header.id,
        order: DEFAULT_SORT_DIRECTION,
        customSort: header.customSort,
      };
      setHeaderSelected(newHeaderSelected);
      sort(newHeaderSelected);
    }
  };

  return (
    <table
      className={cx({
        'w-full': true,
        [className]: !!className,
      })}
      role="grid"
    >
      <thead>
        <tr className="bg-white">
          {/* Add property to specify header to sort by, this should probably work as well when
          clicking on header, also support custom sort function */}
          {headers.map((header) => (
            <th
              key={`header-${header.id}`}
              className={cx({
                'px-4 text-left cursor-pointer': true,
                [header.className]: !!header.className,
              })}
              onClick={() => handleHeaderClick(header)}
            >
              <div className="flex items-center">
                {header.label}
                {headerSelected?.id === header.id
                  && <Icon icon={headerSelected.order === Direction.DESC ? ARROW_DOWN_SVG : ARROW_UP_SVG} className="w-4 h-4 pl-2" />}
              </div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sortedBody.map((row, rowIndex) => {
          const { id: rowId } = row;
          const rowIsSelected = rowId === selectedRowId;

          return (
            <tr
              key={row.id}
              className={cx({
                'bg-gray-100': !rowIsSelected && (rowIndex + 1) % 2 === 0,
                'bg-white': !rowIsSelected && (rowIndex + 1) % 2 === 1,
                'bg-primary-500': rowIsSelected,
              })}
            >
              {
                headers.map(({ id: headerId, Cell }: TableHeaderItem) => {
                  const value = row[headerId];
                  const CellIsFunction = typeof Cell === 'function';

                  const rowData = {
                    ...row,
                    isSelected: rowIsSelected,
                  };

                  return (
                    <td
                      key={`td-${headerId}-${value}`}
                      className="px-4 py-2"
                      role="gridcell"
                    >
                      {/* Cell is a function */}
                      {CellIsFunction && Cell(value, rowData)}

                      {!Cell && value}
                    </td>
                  );
                })
              }
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default Table;
